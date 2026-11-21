// A new value on every build: busts browser caches, and gives the footer its "last updated" date.
export default { id: Date.now().toString(36), date: new Date().toISOString() };
