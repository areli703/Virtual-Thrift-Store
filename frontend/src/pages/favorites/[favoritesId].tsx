import { mdiChartTimelineVariant, mdiUpload } from '@mdi/js';
import Head from 'next/head';
import React, { ReactElement, useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';

import CardBox from '../../components/CardBox';
import LayoutAuthenticated from '../../layouts/Authenticated';
import SectionMain from '../../components/SectionMain';
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton';
import { getPageTitle } from '../../config';

import { Field, Form, Formik } from 'formik';
import FormField from '../../components/FormField';
import BaseDivider from '../../components/BaseDivider';
import BaseButtons from '../../components/BaseButtons';
import BaseButton from '../../components/BaseButton';
import FormCheckRadio from '../../components/FormCheckRadio';
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup';
import FormFilePicker from '../../components/FormFilePicker';
import FormImagePicker from '../../components/FormImagePicker';
import { SelectField } from '../../components/SelectField';
import { SelectFieldMany } from '../../components/SelectFieldMany';
import { SwitchField } from '../../components/SwitchField';
import { RichTextField } from '../../components/RichTextField';

import { update, fetch } from '../../stores/favorites/favoritesSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditFavorites = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    favorite_id: '',

    user: '',

    target_listing: '',
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { favorites } = useAppSelector((state) => state.favorites);

  const { favoritesId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: favoritesId }));
  }, [favoritesId]);

  useEffect(() => {
    if (typeof favorites === 'object') {
      setInitialValues(favorites);
    }
  }, [favorites]);

  useEffect(() => {
    if (typeof favorites === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = favorites[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [favorites]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: favoritesId, data }));
    await router.push('/favorites/favorites-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit favorites')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit favorites'}
          main
        >
          {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            enableReinitialize
            initialValues={initialValues}
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>
              <FormField label='FavoriteID'>
                <Field
                  type='number'
                  name='favorite_id'
                  placeholder='FavoriteID'
                />
              </FormField>

              <FormField label='User' labelFor='user'>
                <Field
                  name='user'
                  id='user'
                  component={SelectField}
                  options={initialValues.user}
                  itemRef={'users'}
                  showField={'firstName'}
                ></Field>
              </FormField>

              <FormField label='TargetListing' labelFor='target_listing'>
                <Field
                  name='target_listing'
                  id='target_listing'
                  component={SelectField}
                  options={initialValues.target_listing}
                  itemRef={'item_listings'}
                  showField={'title'}
                ></Field>
              </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type='submit' color='info' label='Submit' />
                <BaseButton type='reset' color='info' outline label='Reset' />
                <BaseButton
                  type='reset'
                  color='danger'
                  outline
                  label='Cancel'
                  onClick={() => router.push('/favorites/favorites-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditFavorites.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_FAVORITES'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditFavorites;
