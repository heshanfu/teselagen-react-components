import React from "react";
import { lifecycle, compose, branch } from "recompose";
import { withRouter } from "react-router-dom";
import {
  MenuItem,
  MenuDivider,
  Tooltip,
  KeyCombo,
  ContextMenu,
  Menu
} from "@blueprintjs/core";
import { startCase, omit } from "lodash";

const noop = () => {};

// Enhanced MenuItem that supports history-based navigation when passed a
// `navTo` prop
export const EnhancedMenuItem = compose(
  lifecycle({
    componentDidMount: function() {
      const { didMount = noop, className } = this.props;
      didMount({ className });
    },
    componentWillUnmount: function() {
      const { willUnmount = noop, className } = this.props;
      willUnmount({ className });
    }
  }),
  branch(({ navTo }) => navTo, withRouter)
)(function({ navTo, staticContext, ...props }) {
  let clickHandler = props.onClick;
  if (navTo) {
    clickHandler = e => {
      if (e.metaKey || e.ctrlKey) {
        window.open(navTo);
      } else {
        props.history.push(navTo);
      }
      if (props.onClick) props.onClick(e);
    };
  }
  return <MenuItem {...props} onClick={clickHandler} />;
});

// First Non-Undefined
function fnu(...args) {
  return args.find(v => v !== undefined);
}

// Sets a tick icon if items has a `checked` prop
export const tickMenuEnhancer = def => {
  const out = { ...def };
  if (out.checked !== undefined) {
    out.icon = out.checked ? "small-tick" : "blank";
  }
  return out;
};

// Derives various menu item props based on command objects matched via the `cmd`
// prop. Derived props include `text`, `icon`, `hotkey`, `onClick` and `disabled`.
export const commandMenuEnhancer = (commands, config = {}) => (
  def,
  context
) => {
  const cmdId = typeof def === "string" ? def : def.cmd;
  let item = typeof def === "string" ? { cmd: def } : { ...def };

  const useTicks = fnu(item.useTicks, config.useTicks);
  delete item.useTicks;

  if (cmdId && commands[cmdId] && def.divider === undefined) {
    const command = commands[cmdId];

    const { isActive, isDisabled, isHidden } = command;
    const toggles = isActive !== undefined;

    item.hidden = fnu(item.hidden, isHidden);
    item.disabled = fnu(item.disabled, isDisabled);

    item.key = item.key || cmdId;

    if (toggles) {
      if (useTicks) {
        item.text = item.text || command.shortName || command.name;
        item.checked = isActive;
      } else {
        item.text =
          item.text ||
          (isActive ? command.name : command.inactiveName || command.name);
        item.icon =
          item.icon ||
          (isActive ? command.icon : command.inactiveIcon || command.icon);
      }
    } else {
      item.text = item.text || command.name;
      item.icon = item.icon || command.icon;
    }

    item.hotkey = item.hotkey || command.hotkey;
    if (!item.onClick) {
      item.onClick = event =>
        command.execute({
          event,
          context,
          menuItem: item,
          viaMenu: true
        });
    }
  } else if (cmdId && !commands[cmdId]) {
    item.text = item.text || startCase(cmdId);
    item.disabled = true;
  }

  if (config.omitIcons) {
    item.icon = undefined;
  }

  if (config.forceIconAlignment !== false) {
    item.icon = item.icon || "blank";
  }

  if (useTicks) {
    item = tickMenuEnhancer(item);
  }

  return item;
};

const ident = x => x;

const dividerShorthandEnhancer = def =>
  typeof def === "string" && def.startsWith("--")
    ? { divider: def.substr(2) }
    : def;

/** A menu item component that adds many features over the standard MenuItem,
 * and allows for dynamic menu structures that are computed efficiently (only
 * visible sections are computed and rendered).
 * TODO: document and add examples
 */
export const DynamicMenuItem = ({ def, enhancers = [ident], context }) => {
  // If passed an element instead of a menu item definition, return it.
  // This allows mixing menu item elements and menu item defs, and makes it
  // safe to call menu creation utils with their own output.
  if (React.isValidElement(def)) return def;

  const item = [dividerShorthandEnhancer, ...enhancers].reduce(
    (v, f) => f(v, context),
    def
  );
  let out;

  if (item.divider !== undefined) {
    out = <MenuDivider {...(item.divider ? { title: item.divider } : {})} />;
  } else {
    const ItemComponent = item.component || EnhancedMenuItem;
    out = (
      <ItemComponent
        {...omit(item, ["submenu", "hotkey"])}
        icon={item.icon || item.iconName}
        labelElement={item.hotkey && <KeyCombo minimal combo={item.hotkey} />}
        text={item.text}
      >
        {item.submenu
          ? item.submenu
              .filter(ident)
              .map((def, index) => (
                <DynamicMenuItem {...{ def, enhancers, context }} key={index} />
              ))
          : undefined}
      </ItemComponent>
    );
  }
  // if (item.disabled && item.disabledTooltip) {
  //   item.tooltip = def.disabledTooltip
  // }
  if (item.disabled && typeof item.disabled === "string") {
    item.tooltip = item.disabled;
  }

  if (item.tooltip) {
    out = <Tooltip content={item.tooltip}>{out}</Tooltip>;
  }

  return item.hidden ? null : out;
};

// Map the passed item definition(s) to DynamicMenuItem elements
export const createDynamicMenu = (menuDef, enhancers, context) => {
  if (menuDef instanceof Array) {
    return menuDef.map((def, index) => (
      <DynamicMenuItem {...{ def, enhancers, context }} key={index} />
    ));
  } else {
    return <DynamicMenuItem {...{ def: menuDef, enhancers, context }} />;
  }
};

// Create a "bar" menu, keeping the top level array unchanged, and only
// map their submenus to DynamicMenuItem elements
export const createDynamicBarMenu = (topMenuDef, enhancers, context) => {
  return topMenuDef.map(topLevelItem => {
    const def = { ...topLevelItem };
    if (def.submenu) {
      def.submenu = def.submenu.map((subdef, index) => (
        <DynamicMenuItem def={subdef} {...{ enhancers, context }} key={index} />
      ));
    }
    return def;
  });
};

// Shorthand for command-based menus
export const createCommandMenu = (menuDef, commands, config, context) => {
  return createDynamicMenu(
    menuDef,
    [commandMenuEnhancer(commands, config)],
    context
  );
};

// Shorthand for command-based bar menus
export const createCommandBarMenu = (menuDef, commands, config, context) => {
  return createDynamicBarMenu(
    menuDef,
    [commandMenuEnhancer(commands, config)],
    context
  );
};

export function showCommandContextMenu(
  menuDef,
  commands,
  config,
  event,
  onClose,
  context
) {
  return showContextMenu(
    menuDef,
    [commandMenuEnhancer(commands, config)],
    context,
    event,
    onClose
  );
}

/**
 * TODO: update documentation. This is now an alias of createDynamicMenu
 *
 * Creates the contents of a Blueprint menu based on a given menu structure.
 *
 * The input can be an array of item objects, where each may contain:
 * text: text to show
 * key: React key to use (optional)
 * divider: indicates it's a divider instead of an item. Use an empty string
 *   for a normal divider, or some label text for a labeled one
 * icon: name of icon to show (optional)
 * label: right-aligned label, used mostly for shortcuts (optional)
 * hotkey: right-aligned label formatted with <KeyCombo> (optional)
 * tooltip: tooltip text to use (optional)
 * submenu: nested menu structure describing submenu (i.e. array of item objects),
 *   or array of MenuItem elements
 * onClick: click handler
 * navTo: a url to navigate to (assumes react-router)
 * href: a url to link to
 * target: link target
 *
 * Since this function is recursive (to handle nested submenus), and React
 * elements passed as input are returned unchanged, it is possible to freely mix
 * item objects and MenuItem elements. That also makes it safe to call the function
 * with its own output.
 *
 * A customize function may also be provided, and allows customization or
 * replacement of the created MenuItems, allowing for custom props or behavior.
 * That function receives the original created element and the item object, and
 * must return an element.
 *
 * Usage example:
 *
 * const menu = createMenu([
 *   { text: 'Item One', icon: 'add', onClick: () => console.log('Clicked 1') },
 *   { text: 'Item One', onClick: () => console.log('Clicked 2') },
 *   { divider: '' },
 *   { text: 'Item Three', icon: 'numerical', onClick: () => console.log('Clicked 3') },
 *   { divider: '' },
 *   { text: 'Submenus', submenu: [
 *     { text: 'Sub One' },
 *     { text: 'Sub Two' },
 *   ]},
 * ]);
 *
 */
export const createMenu = createDynamicMenu;

export function showContextMenu(menuDef, enhancers, event, onClose, context) {
  menuDef = filterMenuForCorrectness(menuDef);
  if (!menuDef) return;

  // Render a context menu at the passed event's position
  ContextMenu.show(
    <Menu>{createDynamicMenu(menuDef, enhancers, context)}</Menu>,
    { left: event.clientX, top: event.clientY },
    onClose
  );
  event.stopPropagation();
  event.preventDefault();
}

function filterMenuForCorrectness(menuDef) {
  return menuDef && menuDef.length && menuDef.filter(ident);
}
