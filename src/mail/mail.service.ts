import got from 'got';
import * as FormData from 'form-data';
import { Inject, Injectable } from '@nestjs/common';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { EmailVar, MailModuleOptions } from './mail.interfaces';

@Injectable()
export class MailService {
  constructor(
    @Inject(CONFIG_OPTIONS) private readonly options: MailModuleOptions,
  ) {}

  private async sendEmail(
    subject: string,
    template: string,
    to: string,
    emailVars: EmailVar[],
  ) {
    const form = new FormData();
    form.append(
      'from',
      `FooDelivery Support Team <foodelivery@${this.options.domain}>`,
    );
    form.append('to', to);
    form.append('subject', subject);
    form.append('template', template);
    emailVars.forEach((eVar) => form.append(`v:${eVar.key}`, eVar.value));
    //v:username, 'greatcky83'
    // form.append('v:code', 'test_code');
    // form.append('v:username', 'greatcky83');
    // form.append('text', content);
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
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    } catch (error) {
      console.log(error);
    }
  }

  sendVerificationEmail(email: string, code: string) {
    this.sendEmail('Verify Your Email', 'verify_email', email, [
      { key: 'code', value: code },
      { key: 'username', value: email },
    ]);
  }
}
