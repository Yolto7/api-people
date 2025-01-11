interface Response {
  statusCode: number;
  isBase64Encoded: boolean;
  body?: string;
}

export class AppSuccess {
  private static response: Response = {
    statusCode: 200,
    isBase64Encoded: false,
    body: undefined,
  };

  static status(statusCode = 200) {
    this.response.statusCode = statusCode;
    return this;
  }

  static json({ message, data = null }: { message: string; data?: unknown }) {
    this.response.body = JSON.stringify({
      success: true,
      message,
      data,
    });

    return this.response;
  }
}
