

export default class MacroGlobals {

  static $convo() {
    const $convo = globalThis?.SCOUT9?.$convo;
    if (!$convo) {
      throw new Error(`$convo not found in runtime context, ${MacroGlobals.#hint}`);
    }
    return $convo;
  }

  static event() {
    const event = globalThis?.SCOUT9;
    if (!event) {
      throw new Error(`No runtime context, ${MacroGlobals.#hint}`);
    }
    return event;
  }

  static #hint = `make sure the context is properly instantiated before running workflow.`;
}
