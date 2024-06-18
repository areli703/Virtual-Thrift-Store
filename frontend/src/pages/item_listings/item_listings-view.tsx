import React, { ReactElement, useEffect } from 'react';
import Head from 'next/head';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { fetch } from '../../stores/item_listings/item_listingsSlice';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';
import LayoutAuthenticated from '../../layouts/Authenticated';
import { getPageTitle } from '../../config';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import SectionMain from '../../components/SectionMain';
import CardBox from '../../components/CardBox';
import BaseButton from '../../components/BaseButton';
import BaseDivider from '../../components/BaseDivider';
import { mdiChartTimelineVariant } from '@mdi/js';
import { SwitchField } from '../../components/SwitchField';
import FormField from '../../components/FormField';

const Item_listingsView = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { item_listings } = useAppSelector((state) => state.item_listings);

  const { id } = router.query;

  function removeLastCharacter(str) {
    console.log(str, `str`);
    return str.slice(0, -1);
  }

  useEffect(() => {
    dispatch(fetch({ id }));
  }, [dispatch, id]);

  return (
    <>
      <Head>
        <title>{getPageTitle('View item_listings')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={removeLastCharacter('View item_listings')}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>ListingID</p>
            <p>{item_listings?.listing_id || 'No data'}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Seller</p>

            <p>{item_listings?.seller?.firstName ?? 'No data'}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Title</p>
            <p>{item_listings?.title}</p>
          </div>

          <FormField label='Multi Text' hasTextareaHeight>
            <textarea
              className={'w-full'}
              disabled
              value={item_listings?.description}
            />
          </FormField>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Price</p>
            <p>{item_listings?.price || 'No data'}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Category</p>
            <p>{item_listings?.category ?? 'No data'}</p>
          </div>

          <div className={'mb-4'}>
            <p className={'block font-bold mb-2'}>Photos</p>
            {item_listings?.photos?.length ? (
              <ImageField
                name={'photos'}
                image={item_listings?.photos}
                className='w-20 h-20'
              />
            ) : (
              <p>No Photos</p>
            )}
          </div>

          <FormField label='ExpirationDate'>
            {item_listings.expiration_date ? (
              <DatePicker
                dateFormat='yyyy-MM-dd hh:mm'
                showTimeSelect
                selected={
                  item_listings.expiration_date
                    ? new Date(
                        dayjs(item_listings.expiration_date).format(
                          'YYYY-MM-DD hh:mm',
                        ),
                      )
                    : null
                }
                disabled
              />
            ) : (
              <p>No ExpirationDate</p>
            )}
          </FormField>

          <>
            <p className={'block font-bold mb-2'}>FavoritedBy</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>First Name</th>

                      <th>Last Name</th>

                      <th>Phone Number</th>

                      <th>E-Mail</th>

                      <th>Disabled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item_listings.favorited_by &&
                      Array.isArray(item_listings.favorited_by) &&
                      item_listings.favorited_by.map((item: any) => (
                        <tr
                          key={item.id}
                          onClick={() =>
                            router.push(`/users/users-view/?id=${item.id}`)
                          }
                        >
                          <td data-label='firstName'>{item.firstName}</td>

                          <td data-label='lastName'>{item.lastName}</td>

                          <td data-label='phoneNumber'>{item.phoneNumber}</td>

                          <td data-label='email'>{item.email}</td>

                          <td data-label='disabled'>
                            {dataFormatter.booleanFormatter(item.disabled)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!item_listings?.favorited_by?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <>
            <p className={'block font-bold mb-2'}>Favorites TargetListing</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>FavoriteID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item_listings.favorites_target_listing &&
                      Array.isArray(item_listings.favorites_target_listing) &&
                      item_listings.favorites_target_listing.map(
                        (item: any) => (
                          <tr
                            key={item.id}
                            onClick={() =>
                              router.push(
                                `/favorites/favorites-view/?id=${item.id}`,
                              )
                            }
                          >
                            <td data-label='favorite_id'>{item.favorite_id}</td>
                          </tr>
                        ),
                      )}
                  </tbody>
                </table>
              </div>
              {!item_listings?.favorites_target_listing?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <>
            <p className={'block font-bold mb-2'}>Reviews TargetListing</p>
            <CardBox
              className='mb-6 border border-gray-300 rounded overflow-hidden'
              hasTable
            >
              <div className='overflow-x-auto'>
                <table>
                  <thead>
                    <tr>
                      <th>ReviewID</th>

                      <th>Rating</th>

                      <th>Comment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item_listings.reviews_target_listing &&
                      Array.isArray(item_listings.reviews_target_listing) &&
                      item_listings.reviews_target_listing.map((item: any) => (
                        <tr
                          key={item.id}
                          onClick={() =>
                            router.push(`/reviews/reviews-view/?id=${item.id}`)
                          }
                        >
                          <td data-label='review_id'>{item.review_id}</td>

                          <td data-label='rating'>{item.rating}</td>

                          <td data-label='comment'>{item.comment}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              {!item_listings?.reviews_target_listing?.length && (
                <div className={'text-center py-4'}>No data</div>
              )}
            </CardBox>
          </>

          <BaseDivider />

          <BaseButton
            color='info'
            label='Back'
            onClick={() => router.push('/item_listings/item_listings-list')}
          />
        </CardBox>
      </SectionMain>
    </>
  );
};

Item_listingsView.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'READ_ITEM_LISTINGS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default Item_listingsView;
