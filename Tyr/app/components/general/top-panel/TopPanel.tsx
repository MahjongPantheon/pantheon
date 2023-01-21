import * as React from 'react';
import './top-panel.css';
import { SearchInput } from '#/components/general/search-input/SearchInput';
import BackIcon from '../../../img/back.svg?svgr';

type IProps = {
  onBackClick?: () => void;
  showSearch?: boolean;
  onSearchChange?: (value: string) => void;
};

export const TopPanel = React.memo(function (props: IProps) {
  const { showSearch, onBackClick, onSearchChange } = props;

  return (
    <div className='top-panel'>
      <div className='svg-button' onClick={onBackClick}>
        <BackIcon />
      </div>

      {showSearch && onSearchChange && (
        <div className='top-panel__search'>
          <SearchInput onChange={onSearchChange} />
        </div>
      )}
    </div>
  );
});
