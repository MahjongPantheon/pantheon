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
