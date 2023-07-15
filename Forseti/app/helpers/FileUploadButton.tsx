import { I18nService } from '../services/i18n';
import * as React from 'react';
import { ChangeEvent } from 'react';
import { Button } from '@mantine/core';

export const FileUploadButton = ({
  i18n,
  onChange,
}: {
  i18n: I18nService;
  onChange: (file?: File) => void;
}) => {
  // Create a reference to the hidden file input element
  const hiddenFileInput = React.useRef<HTMLInputElement>(null);

  // Programatically click the hidden file input element
  // when the Button component is clicked
  const handleClick = () => {
    hiddenFileInput?.current?.click();
  };
  // Call a function (passed as a prop from the parent component)
  // to handle the user-selected file
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const fileUploaded = event.target.files?.[0];
    onChange(fileUploaded);
  };
  return (
    <>
      <Button onClick={handleClick}>{i18n._t('Select an avatar')}</Button>
      <input
        type='file'
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
};
