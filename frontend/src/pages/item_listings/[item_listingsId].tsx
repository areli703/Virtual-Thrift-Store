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

import { update, fetch } from '../../stores/item_listings/item_listingsSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditItem_listings = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    listing_id: '',

    seller: '',

    title: '',

    description: '',

    price: '',

    category: '',

    photos: [],

    expiration_date: new Date(),

    favorited_by: [],
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { item_listings } = useAppSelector((state) => state.item_listings);

  const { item_listingsId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: item_listingsId }));
  }, [item_listingsId]);

  useEffect(() => {
    if (typeof item_listings === 'object') {
      setInitialValues(item_listings);
    }
  }, [item_listings]);

  useEffect(() => {
    if (typeof item_listings === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = item_listings[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [item_listings]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: item_listingsId, data }));
    await router.push('/item_listings/item_listings-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit item_listings')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit item_listings'}
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
              <FormField label='ListingID'>
                <Field
                  type='number'
                  name='listing_id'
                  placeholder='ListingID'
                />
              </FormField>

              <FormField label='Seller' labelFor='seller'>
                <Field
                  name='seller'
                  id='seller'
                  component={SelectField}
                  options={initialValues.seller}
                  itemRef={'users'}
                  showField={'firstName'}
                ></Field>
              </FormField>

              <FormField label='Title'>
                <Field name='title' placeholder='Title' />
              </FormField>

              <FormField label='Description' hasTextareaHeight>
                <Field
                  name='description'
                  as='textarea'
                  placeholder='Description'
                />
              </FormField>

              <FormField label='Price'>
                <Field type='number' name='price' placeholder='Price' />
              </FormField>

              <FormField label='Category' labelFor='category'>
                <Field name='Category' id='Category' component='select'>
                  <option value='Clothing'>Clothing</option>

                  <option value='Electronics'>Electronics</option>

                  <option value='HomeDecor'>HomeDecor</option>
                </Field>
              </FormField>

              <FormField>
                <Field
                  label='Photos'
                  color='info'
                  icon={mdiUpload}
                  path={'item_listings/photos'}
                  name='photos'
                  id='photos'
                  schema={{
                    size: undefined,
                    formats: undefined,
                  }}
                  component={FormImagePicker}
                ></Field>
              </FormField>

              <FormField label='ExpirationDate'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.expiration_date
                      ? new Date(
                          dayjs(initialValues.expiration_date).format(
                            'YYYY-MM-DD hh:mm',
                          ),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({
                      ...initialValues,
                      expiration_date: date,
                    })
                  }
                />
              </FormField>

              <FormField label='FavoritedBy' labelFor='favorited_by'>
                <Field
                  name='favorited_by'
                  id='favorited_by'
                  component={SelectFieldMany}
                  options={initialValues.favorited_by}
                  itemRef={'users'}
                  showField={'firstName'}
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
                  onClick={() =>
                    router.push('/item_listings/item_listings-list')
                  }
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditItem_listings.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_ITEM_LISTINGS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditItem_listings;
