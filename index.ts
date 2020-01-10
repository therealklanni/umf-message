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
 * @extends [[UMFMessageLong]]
 */
export interface UMFMessageMinimal extends Omit<UMFMessageLong, 'mid' | 'timestamp' | 'version'> {
  mid?: string
  timestamp?: string
  version?: string
}

/**
 * Creates UMF message objects
 *
 * ```typescript
 * const message = new UMFMessage({ to: 'service', from: 'client', body: {} })
 * ```
 */
export default class UMFMessage implements UMFMessageLong {
  public readonly mid!: string
  public readonly rmid?: string
  public readonly to!: string
  public readonly forward?: string
  public readonly from!: string
  public readonly type?: string
  public readonly version = 'UMF/1.4.6'
  public readonly priority?: string
  public readonly timestamp!: string
  public readonly ttl?: string
  public readonly body!: object
  public readonly authorization?: string
  public readonly for?: string
  public readonly via?: string
  public readonly headers?: UMFHeaders
  public readonly timeout?: number
  public readonly signature?: string

  public constructor(message: UMFMessageMinimal) {
    this.mid = message.mid ?? uuid()
    this.to = message.to as string
    this.from = message.from as string
    this.timestamp = message.timestamp ?? new Date().toISOString()
    this.body = message.body

    if (message.rmid) {
      this.rmid = message.rmid
    }

    if (message.forward) {
      this.forward = message.forward
    }

    if (message.type) {
      this.type = message.type
    }

    if (message.priority) {
      this.priority = message.priority
    }

    if (message.ttl) {
      this.ttl = message.ttl
    }

    if (message.authorization) {
      this.authorization = message.authorization
    }

    if (message.for) {
      this.for = message.for
    }

    if (message.via) {
      this.via = message.via
    }

    if (message.headers) {
      this.headers = message.headers
    }

    if (!isNil(message.timeout)) {
      this.timeout = message.timeout
    }

    if (message.signature) {
      this.signature = message.signature
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
      signature: crypto
        .createHmac(algorithm, secret)
        .update(this.toString())
        .digest('hex')
    })
  }

  /**
   * Convert from [[UMFMessageShort]] back to [[UMFMessageLong]]
   *
   * @param message Message to convert
   */
  public static toLong(message: Partial<UMFMessageShort>): Partial<UMFMessageLong> {
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
    } = message as UMFMessageShort

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
   * Returns a transformed [[UMFMessage]] with short property names
   *
   * @param message Message to convert
   */
  public toShort(): Partial<UMFMessageShort> {
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
    } = this

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
   * @returns JSON formatted UMF message
   */
  public toString(): string {
    return JSON.stringify(this)
  }
}
