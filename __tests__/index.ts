/* eslint-disable init-declarations */
import mockDate from 'mockdate'
import uuid from 'uuid/v4'

import UMFMessage, { UMFMessageMinimal, UMFMessageLong } from '../index'

jest.mock('uuid/v4', () => jest.fn(() => '2335eac5-a27e-447e-baca-1050a7e726af'))

const mid = uuid()

describe('class UMFMessage', () => {
  const slimMessage: UMFMessageMinimal = {
    to: 'service',
    from: 'client',
    body: {}
  }
  const now = Date.now()

  mockDate.set(now)

  const isoDate = new Date().toISOString()
  const fatMessage: UMFMessageLong = {
    ...slimMessage,
    mid,
    version: 'UMF/1.4.6',
    timestamp: isoDate,
    rmid: mid,
    forward: 'client',
    type: 'any',
    priority: '1',
    ttl: '10',
    authorization: 'jwt',
    for: 'client',
    via: 'service',
    headers: {},
    timeout: 10
  }

  it('should instantiate a new UMFMessage object', () => {
    expect(new UMFMessage(slimMessage)).toBeInstanceOf(UMFMessage)
  })

  describe('methods', () => {
    let message: UMFMessage

    beforeEach(() => {
      message = new UMFMessage(slimMessage)
    })

    describe('toString', () => {
      it('should JSON.stringify the UMF message object', () => {
        expect(message.toString()).toStrictEqual(
          `{"version":"UMF/1.4.6","mid":"${mid}","to":"service","from":"client","timestamp":"${isoDate}","body":{}}`
        )
      })
    })

    describe('toLong', () => {
      it('should output UMFMessageShort', () => {
        expect(message.toShort()).toStrictEqual({
          to: 'service',
          frm: 'client',
          bdy: {},
          ver: 'UMF/1.4.6',
          mid,
          ts: new Date().toISOString()
        })
      })
    })
  })

  describe('static methods', () => {
    let message: UMFMessage

    beforeEach(() => {
      message = new UMFMessage(slimMessage)
    })

    describe('toLong', () => {
      it('should output UMFMessageLong', () => {
        expect(UMFMessage.toLong(message.toShort())).toStrictEqual({
          ...slimMessage,
          version: 'UMF/1.4.6',
          timestamp: isoDate,
          mid
        })
      })
    })

    describe('sign', () => {
      it('should sign a new UMFMessage', () => {
        message = new UMFMessage(fatMessage)

        expect(UMFMessage.sign(message, 'sha1', 'secret')).toStrictEqual(
          expect.objectContaining({
            ...slimMessage,
            version: 'UMF/1.4.6',
            timestamp: isoDate,
            mid,
            signature: expect.stringMatching(/[\w\d]{40}/u)
          })
        )
      })
    })
  })
})
