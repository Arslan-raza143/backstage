/*
 * Copyright 2023 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback } from 'react';
import Button from '@material-ui/core/Button';
import { useContext } from './Context';
import { useTranslationRef } from '@backstage/frontend-plugin-api';
import { homeTranslationRef } from '../../translation';

export const Actions = () => {
  const { collapsed, setCollapsed, visits, numVisitsOpen, loading } =
    useContext();
  const onClick = useCallback(
    () => setCollapsed(prevCollapsed => !prevCollapsed),
    [setCollapsed],
  );
  const { t } = useTranslationRef(homeTranslationRef);
  const label = collapsed
    ? t('visitedByType.action.viewMore')
    : t('visitedByType.action.viewLess');

  if (!loading && visits.length <= numVisitsOpen) return <></>;

  return (
    <Button variant="text" onClick={onClick}>
      {label}
    </Button>
  );
};
