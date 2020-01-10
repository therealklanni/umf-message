import crypto from 'crypto'
import omitBy from 'lodash/omitBy'
import isNil from 'lodash/isNil'
import uuid from 'uuid/v4'

export interface UMFHeaders {
  [key: string]: string
}

export interface UMFMessageShort {
  mid: string
  rmi?: string
  to: string
  fwd?: string
  frm: string
  typ?: string
  ver: string
  pri?: string
  ts: string
  ttl?: string
  bdy: object
  aut?: string
  for?: string
  via?: string
  hdr?: UMFHeaders
  tmo?: number
  sig?: string
}

export interface UMFMessageLong {
  mid: string
  rmid?: string
  to: string
  forward?: string
  from: string
  type?: string
  version: string
  priority?: string
  timestamp: string
  ttl?: string
  body: object
  authorization?: string
  for?: string
  via?: string
  headers?: UMFHeaders
  timeout?: number
  signature?: string
}

/**
 * @extends [[UMFMessageShort]]
 */
export interface UMFMessageMinimal extends Omit<UMFMessageShort, 'mid' | 'ver' | 'ts'> {
  mid?: string
  ts?: string
  ver?: string
}

/**
 * Creates UMF message objects
 *
 * ```typescript
 * const message = new UMFMessage({ to: 'service', frm: 'client', bdy: {} })
 * ```
 */
export default class UMFMessage implements UMFMessageShort {
  public readonly mid!: string
  public readonly rmi?: string
  public readonly to!: string
  public readonly fwd?: string
  public readonly frm!: string
  public readonly typ?: string
  public readonly ver = 'UMF/1.4.6'
  public readonly pri?: string
  public readonly ts!: string
  public readonly ttl?: string
  public readonly bdy!: object
  public readonly aut?: string
  public readonly for?: string
  public readonly via?: string
  public readonly hdr?: UMFHeaders
  public readonly tmo?: number
  public readonly sig?: string

  public constructor(message: UMFMessageMinimal) {
    this.mid = message.mid ?? uuid()
    this.to = message.to as string
    this.frm = message.frm as string
    this.ts = message.ts ?? new Date().toISOString()
    this.bdy = message.bdy

    if (message.rmi) {
      this.rmi = message.rmi
    }

    if (message.fwd) {
      this.fwd = message.fwd
    }

    if (message.typ) {
      this.typ = message.typ
    }

    if (message.pri) {
      this.pri = message.pri
    }

    if (message.ttl) {
      this.ttl = message.ttl
    }

    if (message.aut) {
      this.aut = message.aut
    }

    if (message.for) {
      this.for = message.for
    }

    if (message.via) {
      this.via = message.via
    }

    if (message.hdr) {
      this.hdr = message.hdr
    }

    if (!isNil(message.tmo)) {
      this.tmo = message.tmo
    }

    if (message.sig) {
      this.sig = message.sig
    }
  }

  /**
   * Sign a [[UMFMessage]]
   *
   * @param message [[UMFMessage]] to be signed
   * @param algorithm HMAC algorithm
   * @param secret Shared secret
   */
  public static sign(message: UMFMessage, algorithm: string, secret: string): UMFMessage {
    return new UMFMessage({
      ...message,
      sig: crypto
        .createHmac(algorithm, secret)
        .update(this.toString())
        .digest('hex')
    })
  }

  /**
   * Convert from [[UMFMessageLong]] back to [[UMFMessageShort]]
   *
   * @param message Message to convert
   */
  public static toShort(message: Partial<UMFMessageLong>): Partial<UMFMessageShort> {
    const {
      rmid: rmi,
      forward: fwd,
      from: frm,
      type: typ,
      version: ver,
      priority: pri,
      timestamp: ts,
      body: bdy,
      authorization: aut,
      headers: hdr,
      timeout: tmo,
      signature: sig,
      ...rest
    } = message as UMFMessageLong

    return omitBy<UMFMessageShort>(
      {
        rmi,
        fwd,
        frm,
        typ,
        ver,
        pri,
        ts,
        bdy,
        aut,
        hdr,
        tmo,
        sig,
        ...rest
      },
      isNil
    )
  }

  /**
   * Returns a transformed [[UMFMessage]] with long property names
   */
  public toLong(): Partial<UMFMessageLong> {
    const {
      rmi: rmid,
      fwd: forward,
      frm: from,
      typ: type,
      ver: version,
      pri: priority,
      ts: timestamp,
      bdy: body,
      aut: authorization,
      hdr: headers,
      tmo: timeout,
      sig: signature,
      ...rest
    } = this

    return omitBy<UMFMessageLong>(
      {
        ...rest,
        rmid,
        forward,
        from,
        type,
        version,
        priority,
        timestamp,
        body,
        authorization,
        headers,
        timeout,
        signature
      },
      isNil
    )
  }

  /**
   * @returns JSON formatted UMF message
   */
  public toString(): string {
    return JSON.stringify(this)
  }
}
