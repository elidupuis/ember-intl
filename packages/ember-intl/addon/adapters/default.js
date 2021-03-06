/**
 * Copyright 2015, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 */

import Ember from 'ember';
import Translation from '../models/translation';

const { computed, get, A:emberArray, getOwner } = Ember;

const DefaultTranslationAdapter = Ember.Object.extend({
  _seen: null,

  locales: computed('_seen.[]', function() {
    return get(this, '_seen').map(l => l.localeName);
  }).readOnly(),

  init() {
    this._super(...arguments);
    this._seen = emberArray();
  },

  lookupLocale(localeName) {
    return this._seen.findBy('localeName', localeName);
  },

  localeFactory(localeName) {
    const owner = getOwner(this);
    const lookupName = `ember-intl@translation:${localeName}`;
    let model = owner.lookup(lookupName);

    if (model) {
      return model;
    }

    const Klass = owner._lookupFactory('model:ember-intl-translation') || Translation;
    const ModelKlass = Klass.extend();

    Object.defineProperty(ModelKlass.proto(), 'localeName', {
      writable: false,
      enumerable: true,
      value: localeName
    });

    owner.register(lookupName, ModelKlass);
    model = owner.lookup(lookupName);
    this._seen.pushObject(model);

    return model;
  },

  has(localeName, translationKey) {
    const model = this.lookupLocale(localeName);

    return model && model.has(translationKey);
  },

  lookup(localeNames, translationKey) {
    for (let i=0; i<localeNames.length; i++) {
      const localeName = localeNames[i];
      const model = this.lookupLocale(localeName);

      if (model && model.has(translationKey)) {
        return model.getValue(translationKey);
      }
    }
  },

  translationsFor() {
    return this.localeFactory(...arguments);
  },

  findTranslationByKey() {
    return this.lookup(...arguments);
  }
});

export default DefaultTranslationAdapter;
