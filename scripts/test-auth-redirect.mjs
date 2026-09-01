import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const configSource = fs.readFileSync(new URL('../js/supabase-config.js', import.meta.url), 'utf8');
const authSource = fs.readFileSync(new URL('../js/auth.js', import.meta.url), 'utf8');
const stylesSource = fs.readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

function createElement() {
  const classes = new Set();
  return {
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      contains: name => classes.has(name),
    },
    style: {},
    textContent: '',
    value: '',
  };
}

function createContext({ search = '', hash = '', session = null, getSessionImpl = null } = {}) {
  const elements = new Map();
  const historyCalls = [];
  let historyCallsBeforeGetSession = null;

  const auth = {
    getSession: async () => {
      historyCallsBeforeGetSession = historyCalls.length;
      if (getSessionImpl) return getSessionImpl();
      return { data: { session }, error: null };
    },
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }),
  };

  const window = {
    location: { search, hash, pathname: '/' },
    history: {
      replaceState: (...args) => historyCalls.push(args),
    },
    supabase: {
      createClient: () => ({ auth }),
    },
  };

  const context = vm.createContext({
    URLSearchParams,
    Object,
    console,
    setTimeout,
    clearTimeout,
    window,
    document: {
      getElementById: id => {
        if (!elements.has(id)) elements.set(id, createElement());
        return elements.get(id);
      },
      querySelector: () => createElement(),
      querySelectorAll: () => [],
    },
  });

  vm.runInContext(configSource, context, { filename: 'supabase-config.js' });
  vm.runInContext(authSource, context, { filename: 'auth.js' });

  return {
    context,
    elements,
    historyCalls,
    get historyCallsBeforeGetSession() {
      return historyCallsBeforeGetSession;
    },
  };
}

const implicitInvite = createContext({
  hash: '#access_token=secret-token&type=invite',
});
assert.equal(vm.runInContext('_isPasswordSetupLink()', implicitInvite.context), true);

const pkceInvite = createContext({ search: '?code=secret-code' });
assert.equal(vm.runInContext('_isPasswordSetupLink()', pkceInvite.context), true);

// Regresión móvil: el SDK limpia la URL antes de que initAuth() consulte el
// enlace, pero la captura temprana debe conservar la intención del flujo.
pkceInvite.context.window.location.search = '';
assert.equal(vm.runInContext('_isPasswordSetupLink()', pkceInvite.context), true);
assert.equal(
  vm.runInContext('JSON.stringify(SUPABASE_AUTH_REDIRECT)', pkceInvite.context).includes('secret-code'),
  false,
);

const expiredInvite = createContext({
  search: '?error=access_denied&error_code=otp_expired',
});
assert.equal(vm.runInContext('_isPasswordSetupLink()', expiredInvite.context), true);

// Un enlace vencido no puede reutilizar una sesión que ya estaba abierta en
// el navegador para ofrecer cambiarle la contraseña a esa cuenta.
const expiredWithExistingSession = createContext({
  search: '?error=access_denied&error_code=otp_expired',
  session: { user: { email: 'owner@example.com' } },
});
await vm.runInContext('_showPasswordSetupScreen()', expiredWithExistingSession.context);
assert.equal(expiredWithExistingSession.historyCallsBeforeGetSession, null);
assert.equal(expiredWithExistingSession.elements.get('pwdsetup-form').style.display, 'none');
assert.match(
  expiredWithExistingSession.elements.get('pwdsetup-link-error-message').textContent,
  /no es válido.*ya expiró/,
);
assert.equal(
  expiredWithExistingSession.elements.get('pwdsetup-link-error').classList.contains('visible'),
  true,
);

const normalVisit = createContext({ search: '?utm_source=capacitacion' });
assert.equal(vm.runInContext('_isPasswordSetupLink()', normalVisit.context), false);

const validSession = {
  user: { email: 'persona@example.com' },
};
const setupFlow = createContext({ search: '?code=secret-code', session: validSession });
await vm.runInContext('_showPasswordSetupScreen()', setupFlow.context);
assert.equal(setupFlow.historyCallsBeforeGetSession, 0);
assert.equal(setupFlow.historyCalls.length, 1);
assert.equal(setupFlow.elements.get('password-setup-screen').classList.contains('hidden'), false);
assert.equal(setupFlow.elements.get('pwdsetup-form').style.display, '');
assert.match(setupFlow.elements.get('pwdsetup-email').textContent, /persona@example\.com/);

const missingSession = createContext({ search: '?code=secret-code', session: null });
await vm.runInContext('_showPasswordSetupScreen()', missingSession.context);
assert.equal(missingSession.elements.get('pwdsetup-form').style.display, 'none');
assert.equal(missingSession.elements.get('pwdsetup-link-error').classList.contains('visible'), true);
assert.match(
  missingSession.elements.get('pwdsetup-link-error-message').textContent,
  /No pudimos iniciar la configuración/,
);

const stalledSession = createContext({
  getSessionImpl: () => new Promise(() => {}),
});
await assert.rejects(
  vm.runInContext('_getSessionWithTimeout(5)', stalledSession.context),
  error => error && error.code === 'session_timeout',
);

assert.match(stylesSource, /#password-setup-screen\{[\s\S]*?overflow-y:auto/);
assert.match(stylesSource, /\.pwdsetup-link-error\.visible\{display:block\}/);

console.log('Auth redirect regression tests: 20/20 OK');
