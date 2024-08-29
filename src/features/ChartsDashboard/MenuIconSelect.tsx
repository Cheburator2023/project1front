import * as React from 'react';
import { LegacyRef } from 'react';

import { DropdownContainer, Menu, MenuItem } from '@admiral-ds/react-ui';
import type { RenderOptionProps } from '@admiral-ds/react-ui';
import { IconButton } from '@src/shared/ui/molecules';

export interface MenuIconSelectProps {
  items: { id: string; label: string; value: any; icon?: React.ReactNode }[];
  icon: React.ReactNode;
  onSelectItem?: (value: any) => void;
}

export const MenuIconSelect: React.FC<MenuIconSelectProps> = ({ items, icon, onSelectItem }) => {
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [active, setActive] = React.useState<string | undefined>(undefined);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  const model = React.useMemo(() => {
    return items.map((item) => {
      return {
        id: item.id,
        render: (options: RenderOptionProps) => (
          <MenuItem key={item.id} {...options}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              {item.label}
            </div>
          </MenuItem>
        ),
      };
    }, []);
  }, [items]);

  const handleSelectItem = (value?: string) => {
    setSelected(value);
    setOpen(false);
    if (onSelectItem) {
      const selectedItem = items.find((item) => item.id === value);
      if (selectedItem) {
        onSelectItem(selectedItem.value);
      }
    }
  };

  const clickOutside = (e: Event) => {
    if (e.target && buttonRef.current?.contains(e.target as Node)) {
      return;
    }
    setOpen(!open);
  };

  return (
    <>
      <div ref={buttonRef as unknown as LegacyRef<HTMLDivElement> | undefined}>
        <IconButton icon={icon} onClick={() => setOpen(!open)} />
      </div>
      {open && (
        <DropdownContainer
          alignSelf="auto"
          targetElement={buttonRef.current as Element | undefined}
          onClickOutside={clickOutside}
          className="dropContainerClass"
          targetRef={buttonRef}
        >
          <Menu
            model={model}
            selected={selected}
            active={active}
            onActivateItem={setActive}
            onSelectItem={handleSelectItem}
            style={{
              borderRadius: '4px',
              boxShadow:
                '0px -1.5px 6px rgba(0, 0, 0, 0.06), 0px 0.6px 1.8px rgba(0, 0, 0, 0.1), 0px 3.2px 9px rgba(0, 0, 0, 0.16)',
            }}
          />
        </DropdownContainer>
      )}
    </>
  );
};

