import React, { useState } from 'react';
import { Flexbox } from '../../shared/ui/atoms';
import { TFiltersTest2 } from './TFiltersTest2';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`playground-tabpanel-${index}`}
      aria-labelledby={`playground-tab-${index}`}
      {...other}
    >
      {value === index && <Flexbox>{children}</Flexbox>}
    </div>
  );
};

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  id?: string;
  'aria-controls'?: string;
}

const Tab = ({ label, isActive, onClick, id, 'aria-controls': ariaControls }: TabProps) => {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-controls={ariaControls}
      aria-selected={isActive}
      onClick={onClick}
      style={{
        padding: '12px 24px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        borderBottom: isActive ? '2px solid #1976d2' : '2px solid transparent',
        color: isActive ? '#1976d2' : '#666',
        fontWeight: isActive ? 600 : 400,
        fontSize: '14px',
        transition: 'all 0.2s ease',
        outline: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = '#1976d2';
          e.currentTarget.style.backgroundColor = '#f5f5f5';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.color = '#666';
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
    >
      {label}
    </button>
  );
};

interface TabsProps {
  value: number;
  onChange: (index: number) => void;
  children: React.ReactNode;
}

const Tabs = ({ value, onChange, children }: TabsProps) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        overflowX: 'auto',
        scrollbarWidth: 'thin',
      }}
    >
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<TabProps>, {
            isActive: value === index,
            onClick: () => onChange(index),
          });
        }
        return child;
      })}
    </div>
  );
};

const componentMapping = {
  TFiltersTest2: {
    label: 'Тест фильтров шаблонов 2',
    component: TFiltersTest2,
  },
};

export const Playground = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (newValue: number) => {
    setActiveTab(newValue);
  };

  const componentEntries = Object.entries(componentMapping);

  return (
    <Flexbox flexDirection='column' style={{ height: '100vh' }}>
      <Flexbox>
        <Tabs value={activeTab} onChange={handleTabChange}>
          {componentEntries.map(([key, config], index) => (
            <Tab
              key={key}
              label={config.label}
              isActive={activeTab === index}
              onClick={() => handleTabChange(index)}
              id={`playground-tab-${index}`}
              aria-controls={`playground-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Flexbox>

      <Flexbox style={{ flex: 1, overflow: 'auto' }}>
        {componentEntries.map(([key, config], index) => {
          const Component = config.component;
          return (
            <TabPanel key={key} value={activeTab} index={index}>
              <Component />
            </TabPanel>
          );
        })}
      </Flexbox>
    </Flexbox>
  );
};

