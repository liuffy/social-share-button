/*global FB */

import Domodule from 'domodule';
import { findOne, on } from 'domassist';

const BASE_URLS = {
  twitter: 'https://twitter.com/intent/tweet',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  gplus: 'https://plus.google.com/share',
};

export default class SocialShareButton extends Domodule {
  postInit() {
    const setupMethod = `${this.options.net}Setup`;
    const shareMethod = `${this.options.net}Share`;

    if (!this[shareMethod]) {
      throw new Error(`Sharing method for ${this.options.net} is not implemented`);
    }

    if (this[setupMethod]) {
      this[setupMethod]();
    }

    on(this.el, 'click', e => {
      e.preventDefault();
      this[shareMethod]();
    });
  }

  get required() {
    return {
      options: ['net']
    };
  }

  gplusShare() {
    SocialShareButton.openWindow(this.el.href, '600', '500', 'gplusWindow');
  }

  twitterShare() {
    SocialShareButton.openWindow(this.el.href, '260', '500', 'twitterWindow');
  }

  facebookShare() {
    if (typeof window.FB !== 'undefined' &&
      typeof window.FB.ui !== 'undefined') {
      const object = {
        method: 'share',
        href: window.location.href
      };

      if (this.options.tag) {
        object.hashtag = `#${this.options.tag}`;
      }

      if (this.options.text) {
        object.quote = this.options.text;
      }

      FB.ui(object);
    } else {
      SocialShareButton.openWindow(this.el.href, '440', '600', 'facebookWindow');
    }
  }

  facebookSetup() {
    const params = [`u=${window.location.href}`];

    if (this.options.tag) {
      params.push(`hashtag=${encodeURIComponent(`#${this.options.tag}`)}`);
    }

    if (this.options.text) {
      params.push(`quote=${encodeURIComponent(this.options.text)}`);
    }

    this.el.href = `${BASE_URLS.facebook}?${params.join('&')}`;
  }

  gplusSetup() {
    this.el.href = `${BASE_URLS.gplus}?url=${window.location.href}`;
  }

  twitterSetup() {
    const shareUrl = window.location.href;
    const shareText = this.options.text || SocialShareButton.getTwiMeta('text');
    const shareTag = this.options.tags || SocialShareButton.getTwiMeta('hashtag');
    const shareVia = this.options.via || SocialShareButton.getTwiMeta('author');
    const params = [];

    params.push(`url=${encodeURIComponent(shareUrl)}`);

    if (shareText) {
      params.push(`text=${encodeURIComponent(shareText)}`);
    }

    if (shareTag && shareTag !== 'none') {
      params.push(`hashtags=${encodeURIComponent(shareTag)}`);
    }

    if (shareVia && shareVia !== 'none') {
      params.push(`via=${encodeURIComponent(shareVia)}`);
    }

    this.el.href = `${BASE_URLS.twitter}?${params.join('&')}`;
  }

  static getTwiMeta(tag) {
    const meta = findOne(`meta[property="twi:${tag}"]`);
    return meta ? meta.getAttribute('content') : null;
  }

  static openWindow(url, height, width, key) {
    window.open(
      url,
      key,
      `menubar=no,toolbar=no,left=200,top=200,resizable=yes,scrollbars=no,height=${height},width=${width}`);
  }
}

Domodule.register('SocialShareButton', SocialShareButton);