# ddu-source-pypi_classifiers

[PyPI classifiers](https://pypi.org/classifiers/) source for ddu.vim

This source collects classifiers used by PyPI.

Please read [help](doc/ddu-source-pypi_classifiers.txt) for details.

## Requirements

- [denops.vim](https://github.com/vim-denops/denops.vim)
- [ddu.vim](https://github.com/Shougo/ddu.vim)
- [ddu-kind-word](https://github.com/Shougo/ddu-kind-word)

## Configuration

```vim
" Use pypi_classifiers source.
call ddu#start({ 'sources': [{ 'name': 'pypi_classifiers' }] })
```
