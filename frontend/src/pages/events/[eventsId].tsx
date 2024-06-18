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

import { update, fetch } from '../../stores/events/eventsSlice';
import { useAppDispatch, useAppSelector } from '../../stores/hooks';
import { useRouter } from 'next/router';
import { saveFile } from '../../helpers/fileSaver';
import dataFormatter from '../../helpers/dataFormatter';
import ImageField from '../../components/ImageField';

const EditEvents = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const initVals = {
    event_id: '',

    event_name: '',

    date_and_time: new Date(),

    location: '',

    description: '',

    participants: [],
  };
  const [initialValues, setInitialValues] = useState(initVals);

  const { events } = useAppSelector((state) => state.events);

  const { eventsId } = router.query;

  useEffect(() => {
    dispatch(fetch({ id: eventsId }));
  }, [eventsId]);

  useEffect(() => {
    if (typeof events === 'object') {
      setInitialValues(events);
    }
  }, [events]);

  useEffect(() => {
    if (typeof events === 'object') {
      const newInitialVal = { ...initVals };

      Object.keys(initVals).forEach(
        (el) => (newInitialVal[el] = events[el] || ''),
      );

      setInitialValues(newInitialVal);
    }
  }, [events]);

  const handleSubmit = async (data) => {
    await dispatch(update({ id: eventsId, data }));
    await router.push('/events/events-list');
  };

  return (
    <>
      <Head>
        <title>{getPageTitle('Edit events')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton
          icon={mdiChartTimelineVariant}
          title={'Edit events'}
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
              <FormField label='EventID'>
                <Field type='number' name='event_id' placeholder='EventID' />
              </FormField>

              <FormField label='EventName'>
                <Field name='event_name' placeholder='EventName' />
              </FormField>

              <FormField label='DateandTime'>
                <DatePicker
                  dateFormat='yyyy-MM-dd hh:mm'
                  showTimeSelect
                  selected={
                    initialValues.date_and_time
                      ? new Date(
                          dayjs(initialValues.date_and_time).format(
                            'YYYY-MM-DD hh:mm',
                          ),
                        )
                      : null
                  }
                  onChange={(date) =>
                    setInitialValues({ ...initialValues, date_and_time: date })
                  }
                />
              </FormField>

              <FormField label='Location'>
                <Field name='location' placeholder='Location' />
              </FormField>

              <FormField label='Description' hasTextareaHeight>
                <Field
                  name='description'
                  as='textarea'
                  placeholder='Description'
                />
              </FormField>

              <FormField label='Participants' labelFor='participants'>
                <Field
                  name='participants'
                  id='participants'
                  component={SelectFieldMany}
                  options={initialValues.participants}
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
                  onClick={() => router.push('/events/events-list')}
                />
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  );
};

EditEvents.getLayout = function getLayout(page: ReactElement) {
  return (
    <LayoutAuthenticated permission={'UPDATE_EVENTS'}>
      {page}
    </LayoutAuthenticated>
  );
};

export default EditEvents;
