import { Center, Group, NumberInput, Radio, SimpleGrid, Text } from '@mantine/core';
import * as React from 'react';
import { I18nService } from '#/services/i18n';
import { useState } from 'react';
import { FormHandle } from '#/pages/OwnedEventsEdit/types';
import { UmaType } from '#/clients/atoms.pb';

type UmaSelectProps = {
  form: FormHandle;
  i18n: I18nService;
};

export const UmaSelect: React.FC<UmaSelectProps> = ({ form, i18n }) => {
  const [umaType, setUmaType] = useState<UmaType>('UMA_SIMPLE');
  return (
    <>
      <Radio.Group
        label={i18n._t('Select uma bonus type')}
        {...form.getInputProps('ruleset.umaType')}
        onChange={(v) => {
          setUmaType(v as UmaType);
          form.setFieldValue('ruleset.umaType', v);
        }}
      >
        <Group mt='xs'>
          <Radio value='UMA_SIMPLE' label={i18n._t('Simple rank-based')} />
          <Radio value='UMA_COMPLEX' label={i18n._t('Complex position-based')} />
        </Group>
      </Radio.Group>
      {umaType === 'UMA_SIMPLE' && (
        <SimpleGrid cols={2}>
          <NumberInput
            label={i18n._t('Uma bonus for 1st place')}
            defaultValue={15000}
            {...form.getInputProps('ruleset.uma.place1')}
          />
          <NumberInput
            label={i18n._t('Uma bonus for 2nd place')}
            defaultValue={5000}
            {...form.getInputProps('ruleset.uma.place2')}
          />
          <NumberInput
            label={i18n._t('Uma penalty for 3rd place')}
            defaultValue={-5000}
            {...form.getInputProps('ruleset.uma.place3')}
          />
          <NumberInput
            label={i18n._t('Uma penalty for 4th place')}
            defaultValue={-15000}
            {...form.getInputProps('ruleset.uma.place4')}
          />
        </SimpleGrid>
      )}
      {umaType === 'UMA_COMPLEX' && (
        <SimpleGrid cols={4} style={{ fontSize: '0.875rem' }}>
          <Center>{i18n._t('Place / Session result')}</Center>
          <Text>{i18n._t('3 players with score less than starting')}</Text>
          <Text>{i18n._t('1 player with score less than starting')}</Text>
          <Text>{i18n._t('Otherwise')}</Text>
          <Center>
            <Text>{i18n._t('1st place')}</Text>
          </Center>
          <NumberInput
            defaultValue={12000}
            {...form.getInputProps('ruleset.complexUma.neg3.place1')}
          />
          <NumberInput
            defaultValue={8000}
            {...form.getInputProps('ruleset.complexUma.neg1.place1')}
          />
          <NumberInput
            defaultValue={8000}
            {...form.getInputProps('ruleset.complexUma.otherwise.place1')}
          />
          <Center>
            <Text>{i18n._t('2nd place')}</Text>
          </Center>
          <NumberInput
            defaultValue={-1000}
            {...form.getInputProps('ruleset.complexUma.neg3.place2')}
          />
          <NumberInput
            defaultValue={3000}
            {...form.getInputProps('ruleset.complexUma.neg1.place2')}
          />
          <NumberInput
            defaultValue={4000}
            {...form.getInputProps('ruleset.complexUma.otherwise.place2')}
          />
          <Center>
            <Text>{i18n._t('3rd place')}</Text>
          </Center>
          <NumberInput
            defaultValue={-3000}
            {...form.getInputProps('ruleset.complexUma.neg3.place3')}
          />
          <NumberInput
            defaultValue={1000}
            {...form.getInputProps('ruleset.complexUma.neg1.place3')}
          />
          <NumberInput
            defaultValue={-4000}
            {...form.getInputProps('ruleset.complexUma.otherwise.place3')}
          />
          <Center>
            <Text>{i18n._t('4th place')}</Text>
          </Center>
          <NumberInput
            defaultValue={-8000}
            {...form.getInputProps('ruleset.complexUma.neg3.place4')}
          />
          <NumberInput
            defaultValue={-12000}
            {...form.getInputProps('ruleset.complexUma.neg1.place4')}
          />
          <NumberInput
            defaultValue={-8000}
            {...form.getInputProps('ruleset.complexUma.otherwise.place4')}
          />
        </SimpleGrid>
      )}
    </>
  );
};
