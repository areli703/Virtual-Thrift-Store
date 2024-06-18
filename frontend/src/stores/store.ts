import { configureStore } from '@reduxjs/toolkit';
import styleReducer from './styleSlice';
import mainReducer from './mainSlice';
import authSlice from './authSlice';
import openAiSlice from './openAiSlice';

import usersSlice from './users/usersSlice';
import eventsSlice from './events/eventsSlice';
import favoritesSlice from './favorites/favoritesSlice';
import item_listingsSlice from './item_listings/item_listingsSlice';
import notificationsSlice from './notifications/notificationsSlice';
import reviewsSlice from './reviews/reviewsSlice';
import rolesSlice from './roles/rolesSlice';
import permissionsSlice from './permissions/permissionsSlice';

export const store = configureStore({
  reducer: {
    style: styleReducer,
    main: mainReducer,
    auth: authSlice,
    openAi: openAiSlice,

    users: usersSlice,
    events: eventsSlice,
    favorites: favoritesSlice,
    item_listings: item_listingsSlice,
    notifications: notificationsSlice,
    reviews: reviewsSlice,
    roles: rolesSlice,
    permissions: permissionsSlice,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
