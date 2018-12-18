import {createHash} from 'crypto';
import Document, {Head, Main, NextScript} from 'next/document';
import React from 'react';
import {ServerStyleSheet} from 'styled-components';

function createCSPHashOf(text) {
  const hash = createHash('sha256');
  hash.update(text);
  return `'sha256-${hash.digest('base64')}'`;
}

export default class _Document extends Document {
  static getInitialProps({renderPage}) {
    // Inject `styled-components` styles
    const sheet = new ServerStyleSheet();
    const page = renderPage((Page) => (props) => sheet.collectStyles(<Page {...props} />));
    const styledEls = sheet.getStyleElement();

    return {
      ...page,
      styledEls,
    };
  }

  render() {
    const shouldEnableHMR = process.env.NODE_ENV === 'development';
    const nextScriptScriptSource = NextScript.getInlineScriptSource(this.props);
    const cspRules = [
      'default-src \'self\'',
      `script-src 'self' ${shouldEnableHMR ? '\'unsafe-eval\' ' : ''}${createCSPHashOf(nextScriptScriptSource)}`,
      'style-src \'self\' \'unsafe-inline\'',
      'img-src \'self\' data:',
      'font-src \'self\' data:',
    ];

    return (
      <html>
        <Head>
          <meta key="viewport" name="viewport" content="width=device-width, initial-scale=1, user-scalable=0, maximum-scale=1, minimum-scale=1" />
          <meta key="csp" httpEquiv="Content-Security-Policy" content={cspRules.join('; ')} />

          {this.props.styledEls}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
