import React, { useState } from 'react';
import { DateSelect } from '../../shared/ui/organisms/DateSelect';
import { Flexbox } from '../../shared/ui/atoms';

export const DateSelectExample = () => {
  const [dateValue, setDateValue] = useState<string[]>([]);

  const handleDateChange = (value: string[]) => {
    setDateValue(value);
    console.log('Выбранная дата:', value);
  };

  return (
    <Flexbox flexDirection="column" style={{ padding: '20px', gap: '20px' }}>
      <h2>Пример использования DateSelect</h2>

      <div>
        <h3>Компонент выбора даты:</h3>
        <DateSelect value={dateValue} onChange={handleDateChange} />
      </div>


      {dateValue && (
        <div>
          <h4>Выбранное значение:</h4>
          <p
            style={{
              padding: '10px',
              backgroundColor: '#f5f5f5',
              borderRadius: '4px',
              fontFamily: 'monospace',
            }}
          >
            {Array.isArray(dateValue) ? dateValue.join(', ') : dateValue}
          </p>
        </div>
      )}

      <div>
        <h4>Описание функциональности:</h4>
        <ul>
          <li>Отображает текущую дату или промежуток из фильтра</li>
          <li>Содержит дропдаун с селектом для выбора типа даты</li>
          <li>Поддерживает два типа: точная дата, промежуток дат</li>
          <li>DateField динамически меняет тип в зависимости от выбора</li>
          <li>Поддерживает управление с клавиатуры (Enter, Space)</li>
          <li>Возвращает даты в формате &quot;2025-01-01 00:00:00&quot;</li>
        </ul>
      </div>
    </Flexbox>
  );
};

