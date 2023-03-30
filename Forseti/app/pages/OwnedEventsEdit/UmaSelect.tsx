import { Center, Group, NumberInput, Radio, SimpleGrid, Text } from '@mantine/core';
import * as React from 'react';
import { I18nService } from '#/services/i18n';
import { useState } from 'react';
import { FormHandle } from '#/pages/OwnedEventsEdit/types';

type UmaSelectProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const UmaSelect: React.FC<UmaSelectProps> = ({ form, i18n }) => {
  const [umaType, setUmaType] = useState('simple');
  return (
    <>
      <Radio.Group
        label={i18n._t('Select uma bonus type')}
        {...form.getInputProps('ruleset.umaType')}
        onChange={(v) => {
          setUmaType(v);
          form.setFieldValue('ruleset.umaType', v);
        }}
      >
        <Group mt='xs'>
          <Radio value='simple' label={i18n._t('Simple rank-based')} />
          <Radio value='complex' label={i18n._t('Complex position-based')} />
        </Group>
      </Radio.Group>
      {umaType === 'simple' && (
        <SimpleGrid cols={2}>
          <NumberInput
            label={i18n._t('Uma bonus for 1st place')}
            defaultValue={15000}
            {...form.getInputProps('ruleset.uma.0')}
          />
          <NumberInput
            label={i18n._t('Uma bonus for 2nd place')}
            defaultValue={5000}
            {...form.getInputProps('ruleset.uma.1')}
          />
          <NumberInput
            label={i18n._t('Uma penalty for 3rd place')}
            defaultValue={-5000}
            {...form.getInputProps('ruleset.uma.2')}
          />
          <NumberInput
            label={i18n._t('Uma penalty for 4th place')}
            defaultValue={-15000}
            {...form.getInputProps('ruleset.uma.3')}
          />
        </SimpleGrid>
      )}
      {umaType === 'complex' && (
        <SimpleGrid cols={4} style={{ fontSize: '0.875rem' }}>
          <Center>{i18n._t('Place / Session result')}</Center>
          <Text>{i18n._t('3 players with score less than starting')}</Text>
          <Text>{i18n._t('1 player with score less than starting')}</Text>
          <Text>{i18n._t('Otherwise')}</Text>
          <Center>
            <Text>{i18n._t('1st place')}</Text>
          </Center>
          <NumberInput defaultValue={12000} {...form.getInputProps('ruleset.complexUma.0.0')} />
          <NumberInput defaultValue={8000} {...form.getInputProps('ruleset.complexUma.1.0')} />
          <NumberInput defaultValue={8000} {...form.getInputProps('ruleset.complexUma.2.0')} />
          <Center>
            <Text>{i18n._t('2nd place')}</Text>
          </Center>
          <NumberInput defaultValue={-1000} {...form.getInputProps('ruleset.complexUma.0.1')} />
          <NumberInput defaultValue={3000} {...form.getInputProps('ruleset.complexUma.1.1')} />
          <NumberInput defaultValue={4000} {...form.getInputProps('ruleset.complexUma.2.1')} />
          <Center>
            <Text>{i18n._t('3rd place')}</Text>
          </Center>
          <NumberInput defaultValue={-3000} {...form.getInputProps('ruleset.complexUma.0.2')} />
          <NumberInput defaultValue={1000} {...form.getInputProps('ruleset.complexUma.1.2')} />
          <NumberInput defaultValue={-4000} {...form.getInputProps('ruleset.complexUma.2.2')} />
          <Center>
            <Text>{i18n._t('4th place')}</Text>
          </Center>
          <NumberInput defaultValue={-8000} {...form.getInputProps('ruleset.complexUma.0.3')} />
          <NumberInput defaultValue={-12000} {...form.getInputProps('ruleset.complexUma.1.3')} />
          <NumberInput defaultValue={-8000} {...form.getInputProps('ruleset.complexUma.2.3')} />
        </SimpleGrid>
      )}
    </>
  );
};
