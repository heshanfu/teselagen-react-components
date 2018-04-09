import React from "react";
import { MenuBar } from "../../../src";
export default function InfoHelperDemo() {
  return (
    <div style={{ backgroundColor: '#ddd', height: '500px'}}>
      <MenuBar
        menu={[
          {
            text: 'File',
            submenu: [
              { text: 'New', icon: 'add', onClick: () => alert('New file') },
              { text: 'Open...', icon: 'document', onClick: () => alert('Open file') },
              { divider: '' },
              { text: 'Quit', icon: 'log-out', onClick: () => alert('Quit') },
            ]
          },
          {
            text: 'Edit',
            submenu: [
              { text: 'Cut', icon: 'cut', onClick: () => alert('Cut') },
              { text: 'Copy', icon: 'duplicate', onClick: () => alert('Copy') },
              { text: 'Paste', icon: 'clipboard', onClick: () => alert('Paste') },
              { divider: '' },
              { text: 'Other',
                submenu: [
                  { text: 'Some command 1', icon: 'code', onClick: () => alert('Do something') },
                  { text: 'Some command 2', icon: 'numerical', onClick: () => alert('Do something else') },
                ]
              },
            ]
          },
          { text: 'No Submenu', onClick: () => alert('This triggers an action directly')}
        ]}
      />
      <p>
        The <code>menu</code> prop must be an array of objects with <code>text</code>
        and <code>submenu</code> properties. Each <code>submenu</code> is itself an
        array of item descriptor objects or <code>MenuItem</code> elements.
        Item descriptors may contain several properties, namely <code>text</code>,
        <code>icon</code>, <code>label</code>, <code>onClick</code>, <code>tooltip</code>,
        <code>key</code>, <code>divider</code>, and <code>submenu</code>.
        Check the <code>createMenu()</code> util for more details.
      </p>
    </div>
  );
}