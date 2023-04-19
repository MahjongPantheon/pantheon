/* Tyr - Japanese mahjong assistant application
 * Copyright (C) 2016 Oleg Klimenko aka ctizen
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import useDebounce from '#/components/general/search-input/UseDebounce';
import { i18n } from '#/components/i18n';
import { I18nService } from '#/services/i18n';
import CloseIcon from '../../../img/icons/close.svg?svgr';

type IProps = {
  onChange: (value: string) => void;
};

export const SearchInput = React.memo(function (props: IProps) {
  const { onChange } = props;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      onChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <SearchInputInner onChange={(value) => setSearchTerm(value)} onClear={() => onChange('')} />
  );
});

type IInnerProps = IProps & {
  onClear: () => void;
};

type IState = {
  searchValue: string;
};

class SearchInputInner extends React.Component<IInnerProps, IState> {
  state = {
    searchValue: '',
  };

  private onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    this.setState({
      searchValue: value,
    });
    this.props.onChange(value);
  }

  private onClearClick() {
    this.setState({
      searchValue: '',
    });
    this.props.onClear();
  }

  static contextType = i18n;
  render() {
    const { searchValue } = this.state;
    const loc = this.context as I18nService;
    return (
      <>
        <input
          value={searchValue}
          placeholder={loc._t('type to find someone')}
          onChange={this.onInputChange.bind(this)}
        ></input>
        {!!searchValue && (
          <div onClick={this.onClearClick.bind(this)}>
            <CloseIcon />
          </div>
        )}
      </>
    );
  }
}
