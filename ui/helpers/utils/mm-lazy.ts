import React from 'react';

type DynamicImportType = () => Promise<{ default: React.ComponentType }>;
type ModuleWithDefaultType = {
  default: React.ComponentType;
};

/**
 * A wrapper around React.lazy that adds one thing:
 * 1. React.lazy can only deal with default exports, but the wrapper can handle named exports too
 *
 * @param fn - an import of the form `() => import('AAA')`
 */
export function mmLazy(fn: DynamicImportType) {
  return React.lazy(async () => {
    const importedModule = await fn();
    const { component } = parseImportedComponent(importedModule);
    return component;
  });
}

// There can be a lot of different types here, and we're basically doing type-checking in the code,
// so I don't think TypeScript safety on `importedModule` is worth it in this function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseImportedComponent(importedModule: any): {
  componentName: string; // TODO: in many circumstances, the componentName gets minified
  component: ModuleWithDefaultType;
} {
  let componentName: string;

  // If there's no default export
  if (!importedModule.default) {
    const keys = Object.keys(importedModule);

    // If there's only one named export
    if (keys.length === 1) {
      componentName = keys[0];

      return {
        componentName,
        // Force the component to be the default export
        component: { default: importedModule[componentName] },
      };
    }

    // If there are multiple named exports, this isn't good for tree-shaking, so throw an error
    throw new Error(
      'mmLazy: You cannot lazy-load a component when there are multiple exported components in one file',
    );
  }

  if (importedModule.default.WrappedComponent) {
    // If there's a wrapped component, we don't want to see the name reported as `withRouter(Connect(AAA))` we want just `AAA`
    componentName = importedModule.default.WrappedComponent.name;
  } else {
    componentName =
      importedModule.default.name || importedModule.default.displayName;
  }

  return {
    componentName,
    component: importedModule,
  };
}
