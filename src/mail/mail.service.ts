import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {
    this.sendEmail('test', 'test', `greatcky83@gmail.com`);
  }

  private async sendEmail(subject: string, content: string, to: string) {
    const form = new FormData();
    form.append('from', `FooDelivery <mailgun@${this.options.domain}>`);
    form.append('to', to);
    form.append('subject', subject);
    form.append('text', content);
    // const url = 'https://api.mailgun.net/v3/${this.options.domain}/messages';
    // const options = {
    //   headers: {
    //     Authorization: `Basic ${Buffer.from(
    //       `api:${this.options.apiKey}`,
    //     ).toString('base64')}`,
    //   },
    //   body: form,
    // };
    // const response = await got.post(url, options);

    const response = await got(
      `https://api.mailgun.net/v3/${this.options.domain}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${this.options.apiKey}`,
          ).toString('base64')}`,
        },
        body: form,
      },
    );

    console.log(response.body);
  }
}
