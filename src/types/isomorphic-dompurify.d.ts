/**
 * TypeScript declaration for isomorphic-dompurify
 * Provides type safety for the DOMPurify sanitization library
 */

declare module 'isomorphic-dompurify' {
  export interface Config {
    ALLOWED_TAGS?: string[];
    ALLOWED_ATTR?: string[];
    FORBID_TAGS?: string[];
    FORBID_ATTR?: string[];
    ALLOW_DATA_ATTR?: boolean;
    ALLOW_UNKNOWN_PROTOCOLS?: boolean;
    ALLOW_SELF_CLOSE_IN_ATTR?: boolean;
    SANITIZE_DOM?: boolean;
    SANITIZE_NAMED_PROPS?: boolean;
    KEEP_CONTENT?: boolean;
    IN_PLACE?: boolean;
    USE_PROFILES?: {
      mathMl?: boolean;
      svg?: boolean;
      svgFilters?: boolean;
      html?: boolean;
    };
    RETURN_DOM?: boolean;
    RETURN_DOM_FRAGMENT?: boolean;
    RETURN_TRUSTED_TYPE?: boolean;
    FORCE_BODY?: boolean;
    WHOLE_DOCUMENT?: boolean;
    CUSTOM_ELEMENT_HANDLING?: {
      tagNameCheck?: RegExp | ((tagName: string) => boolean) | null;
      attributeNameCheck?: RegExp | ((attributeName: string) => boolean) | null;
      allowCustomizedBuiltInElements?: boolean;
    };
  }

  export interface SanitizeElementHookEvent {
    tagName: string;
    allowedTags: { [key: string]: boolean };
  }

  export interface SanitizeAttributesHookEvent {
    tagName: string;
    attrName: string;
    attrValue: string;
    allowedAttributes: { [key: string]: boolean };
  }

  export interface DOMPurifyI {
    sanitize(dirty: string | Node, config?: Config): string;
    sanitize(dirty: string | Node, config: Config & { RETURN_DOM_FRAGMENT: true }): DocumentFragment;
    sanitize(dirty: string | Node, config: Config & { RETURN_DOM: true }): Element;

    addHook(hook: 'beforeSanitizeElements', cb: (currentNode: Element, evt: SanitizeElementHookEvent, config: Config) => void): void;
    addHook(hook: 'afterSanitizeElements', cb: (currentNode: Element, evt: SanitizeElementHookEvent, config: Config) => void): void;
    addHook(hook: 'beforeSanitizeAttributes', cb: (currentNode: Element, evt: SanitizeAttributesHookEvent, config: Config) => void): void;
    addHook(hook: 'afterSanitizeAttributes', cb: (currentNode: Element, evt: SanitizeAttributesHookEvent, config: Config) => void): void;

    removeHook(hook: string): void;
    removeHooks(hook: string): void;
    removeAllHooks(): void;

    isValidAttribute(tag: string, attr: string, value: string): boolean;

    version: string;
    removed: Array<{
      element?: Element;
      attribute?: Attr;
      from?: Element;
    }>;
  }

  const DOMPurify: DOMPurifyI;
  export default DOMPurify;
}