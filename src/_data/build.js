// A new value on every build, so browsers never serve a stale stylesheet.
export default { id: Date.now().toString(36) };
