

export default class MacroGlobals {

  static $convo() {
    const $convo = globalThis?.SCOUT9?.$convo;
    if (!$convo) {
      throw new Error(`$convo not found in runtime context, ${MacroGlobals.#hint}`);
    }
    return $convo;
  }

  static #hint = `make sure the context is properly instantiated before running workflow.`;
}
