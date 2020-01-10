/* eslint-disable init-declarations */
import mockDate from 'mockdate'
import uuid from 'uuid/v4'

import UMFMessage, { UMFMessageMinimal, UMFMessageShort } from '../'

jest.mock('uuid/v4', () => jest.fn(() => '2335eac5-a27e-447e-baca-1050a7e726af'))

const mid = uuid()

describe('class UMFMessage', () => {
  const slimMessage: UMFMessageMinimal = {
    to: 'service',
    frm: 'client',
    bdy: {}
  }
  const now = Date.now()

  mockDate.set(now)

  const isoDate = new Date().toISOString()
  const fatMessage: UMFMessageShort = {
    ...slimMessage,
    mid,
    ver: 'UMF/1.4.6',
    ts: isoDate,
    rmi: mid,
    fwd: 'client',
    typ: 'any',
    pri: '1',
    ttl: '10',
    aut: 'jwt',
    for: 'client',
    via: 'service',
    hdr: {},
    tmo: 10
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
          `{"ver":"UMF/1.4.6","mid":"${mid}","to":"service","frm":"client","ts":"${isoDate}","bdy":{}}`
        )
      })
    })

    describe('toLong', () => {
      it('should output UMFMessageLong', () => {
        expect(message.toLong()).toStrictEqual({
          to: 'service',
          from: 'client',
          body: {},
          version: 'UMF/1.4.6',
          mid,
          timestamp: new Date().toISOString()
        })
      })
    })
  })

  describe('static methods', () => {
    let message: UMFMessage

    beforeEach(() => {
      message = new UMFMessage(slimMessage)
    })

    describe('toShort', () => {
      it('should output UMFMessageShort', () => {
        expect(UMFMessage.toShort(message.toLong())).toStrictEqual({
          ...slimMessage,
          ver: 'UMF/1.4.6',
          ts: isoDate,
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
            ver: 'UMF/1.4.6',
            ts: isoDate,
            mid,
            sig: expect.stringMatching(/[\w\d]{40}/u)
          })
        )
      })
    })
  })
})
