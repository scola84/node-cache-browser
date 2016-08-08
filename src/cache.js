export default class BrowserCache {
  constructor() {
    this._expire = new Map();
    this._storage = null;

    this._lifetime = 0;
    this._interval = null;
  }

  destroy() {
    this._expire.forEach((expires, key) => {
      this._storage.removeItem(key);
    });

    this._expire.clear();
    this.interval(null, false);
  }

  storage(storage) {
    if (typeof storage === 'undefined') {
      return this._storage;
    }

    this._storage = storage;
    return this;
  }

  lifetime(lifetime) {
    if (typeof lifetime === 'undefined') {
      return this._lifetime;
    }

    this._lifetime = lifetime;
    return this;
  }

  interval(interval, action) {
    clearInterval(this._interval);

    if (action === false) {
      return this;
    }

    this._interval = setInterval(this._gc.bind(this), interval);
    return this;
  }

  get(key, callback) {
    const data = this._storage.getItem(key);
    callback(null, data ? JSON.parse(data) : null);
  }

  set(key, value, lifetime, callback = () => {}) {
    if (typeof lifetime === 'function') {
      callback = lifetime;
      lifetime = null;
    }

    const expires = this._expires(lifetime);

    if (expires !== null) {
      this._expire.set(key, expires);
    }

    this._storage.setItem(key, JSON.stringify(value));
    callback();
  }

  delete(key, callback = () => {}) {
    this._expire.delete(key);
    this._storage.removeItem(key);

    callback();
  }

  touch(key, lifetime, callback = () => {}) {
    if (typeof lifetime === 'function') {
      callback = lifetime;
      lifetime = null;
    }

    if (!this._expire.has(key)) {
      return;
    }

    this._expire.set(key, this._expires(lifetime));
    callback();
  }

  _expires(lifetime) {
    if (lifetime === null) {
      lifetime = this._lifetime;
    }

    if (lifetime === 0) {
      return null;
    }

    return Date.now() + lifetime;
  }

  _gc() {
    const now = Date.now();

    this._expire.forEach((expires, key) => {
      if (expires < now) {
        this._expire.delete(key);
        this._storage.removeItem(key);
      }
    });
  }
}
