// deno-lint-ignore-file

declare global {
  /**
    * `Interval` is the first argument to a scheduled val.
    `lastRunAt` is useful for polling a data source *since* the last time the val ran. It is `undefined` on the first time the scheduled val runs.
    ```ts
    interface Interval {
        lastRunAt: Date | undefined;
    }
    ```
    */
  interface Interval {
    id: string;
    delay: number;
    author: string;
    registeredAt: Date;
    clearedAt: Date | undefined;
    lastRunAt: Date | undefined;
  }

  /**
   * `Email` is the first argument to an email handler val. It represents the email that triggered the val.
    ```ts
    interface Email {
        from: string,
        to: string,
        cc: string,
        bcc: string,
        subject: string | undefined,
        text: string | undefined,
        html: string | undefined,
    }
    ```
   */
  interface Email {
    from: string,
    to: string,
    cc: string,
    bcc: string,
    subject: string | undefined,
    text: string | undefined,
    html: string | undefined,
  }

  interface ParsedQs {
    [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
  }

  namespace express {
    interface Request {
      get(name: "set-cookie"): string[] | undefined;
      get(name: string): string | undefined;
      header(name: "set-cookie"): string[] | undefined;
      header(name: string): string | undefined;
      is(type: string | string[]): string | false | null;
      protocol: string;
      secure: boolean;
      ip: string;
      ips: string[];
      subdomains: string[];
      path: string;
      hostname: string;
      host: string;
      fresh: boolean;
      stale: boolean;
      xhr: boolean;
      body: any;
      cookies: any;
      method: string;
      params: Record<string, string>;
      query: ParsedQs;
      signedCookies: any;
      originalUrl: string;
      baseUrl: string;
    }

    interface Response {
      status(code: number): this;
      send(body?: any): this;
      json(body?: any): this;
      jsonp(body?: any): this;
      type(type: string): this;
      set(field: any): this;
      set(field: string, value?: string | string[]): this;
      get(field: string): string | undefined;
      redirect(url: string): void;
      redirect(status: number, url: string): void;
      redirect(url: string, status: number): void;
      end(cb?: () => void): this;
      end(chunk: any, cb?: () => void): this;
      end(chunk: any, encoding: any, cb?: () => void): this;
    }
  }

  type JsonPrimitive = string | number | boolean | null;
  type JsonObject = { [Key in string]: JsonValue } & {
    [Key in string]?: JsonValue | undefined;
  };
  type JsonValue = JsonPrimitive | JsonObject | JsonArray;
  type JsonArray = JsonValue[] | readonly JsonValue[];
}

export {};
