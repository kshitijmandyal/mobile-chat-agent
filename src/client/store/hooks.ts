import { useDispatch, useSelector } from 'react-redux';

import type { AppDispatch, RootState } from './store';

// Typed once here so no component has to annotate a dispatch or a selector.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
