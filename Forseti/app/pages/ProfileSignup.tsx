/*  Forseti: personal area & event control panel
 *  Copyright (C) 2023  o.klimenko aka ctizen
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
import { useForm } from '@mantine/form';
import { useI18n } from '#/hooks/i18n';
import {
  Button,
  Checkbox,
  Collapse,
  Container,
  Group,
  PasswordInput,
  Space,
  TextInput,
} from '@mantine/core';
import { IconLock, IconMailQuestion, IconSignature } from '@tabler/icons-react';
import { Link } from 'wouter';
import { useCallback } from 'react';
import { useApi } from '#/hooks/api';
import { environment } from '#config';
import { useDisclosure } from '@mantine/hooks';
import { usePageTitle } from '#/hooks/pageTitle';
import { calcPasswordStrength } from '#/helpers/passwordStrength';

export const ProfileSignup: React.FC = () => {
  const i18n = useI18n();
  usePageTitle(i18n._t('Register new account'));
  const api = useApi();
  api.setEventId(0);
  const form = useForm({
    initialValues: {
      email: '',
      title: '',
      password: '',
      privacyPolicy: false,
    },

    validate: {
      email: (value: string) =>
        /^\S+@\S+$/.test(value.trim().toLowerCase()) ? null : i18n._t('Invalid email'),
      title: (value: string) => (value.trim().toLowerCase() ? null : i18n._t('Invalid title')),
      password: (value: string) =>
        calcPasswordStrength(value) >= 16
          ? null
          : i18n._t('Your password is too weak. Please enter stronger password.'),
      privacyPolicy: (value: boolean) =>
        value ? null : i18n._t('You should read and accept the Privacy Policy'),
    },
  });

  const submitForm = useCallback(
    (values: { email: string; title: string; password: string }) => {
      api
        .requestRegistration(
          values.email.trim().toLowerCase(),
          values.title.trim(),
          values.password.trim()
        )
        .then((resp) => {
          if (resp.approvalCode && !environment.production) {
            // debug mode; code will not be sent in production mode
            alert('Confirmation link: ' + window.location.host + resp.approvalCode);
          }
        })
        .catch(() => {
          form.setFieldError(
            'password',
            i18n._t('Failed to request registration. Is your connection stable?')
          );
        });
    },
    [api]
  );

  const [opened, { toggle }] = useDisclosure(false);

  return (
    <>
      <Container>
        <form onSubmit={form.onSubmit(submitForm)}>
          <TextInput
            icon={<IconMailQuestion size='1rem' />}
            description={i18n._t('Enter your e-mail address')}
            {...form.getInputProps('email')}
          />
          <Space h='md' />
          <TextInput
            icon={<IconSignature size='1rem' />}
            description={i18n._t(
              "This is a title that will be shown in rating table and in mobile assistant, also event administrators will use this title to find you and add to the event. Please don't use your single name here, as it's not unique enough. Name and surname is fine."
            )}
            {...form.getInputProps('title')}
          />
          <Space h='md' />
          <PasswordInput
            description={i18n._t('Enter strong password')}
            icon={<IconLock size='1rem' />}
            {...form.getInputProps('password')}
          />
          <Space h='md' />
          <Checkbox
            mt='md'
            label={i18n._t("I've read the privacy policy listed below and accept its terms")}
            {...form.getInputProps('privacyPolicy', { type: 'checkbox' })}
          />
          <Group position='right' mt='md'>
            <Link to='/profile/login'>
              <Button variant='outline'>{i18n._t('Already registered?')}</Button>
            </Link>
            <Button type='submit'>{i18n._t('Register new account')}</Button>
          </Group>
        </form>

        <Space h='xl' />
        <hr />

        <Group>
          <h2>Privacy Policy</h2>
          <Button onClick={toggle} variant='subtle'>
            {i18n._t('show / hide')}
          </Button>
        </Group>
        <small>Effective date: March 28, 2023</small>
        <Collapse in={opened}>
          <p>
            Pantheon ("us", "we", or "our") operates the {environment.rootUrl} domain and subdomains
            (the "Service").
          </p>
          <p>
            This page informs you of our policies regarding the collection, use, and disclosure of
            personal data when you use our Service and the choices you have associated with that
            data.{' '}
          </p>
          <p>
            We use your data to provide and improve the Service. By using the Service, you agree to
            the collection and use of information in accordance with this policy. Unless otherwise
            defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings
            as in our Terms and Conditions, accessible from {environment.rootUrl}
          </p>

          <h3>Information Collection And Use</h3>

          <p>
            We collect several different types of information for various purposes to provide and
            improve our Service to you.
          </p>

          <h3>Types of Data Collected</h3>

          <h4>Personal Data</h4>

          <p>
            While using our Service, we may ask you to provide us with certain personally
            identifiable information that can be used to contact or identify you ("Personal Data").
            Personally identifiable information may include, but is not limited to:
          </p>

          <ul>
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h4>Usage Data</h4>

          <p>
            We may also collect information how the Service is accessed and used ("Usage Data").
            This Usage Data may include information such as your computer's Internet Protocol
            address (e.g. IP address), browser type, browser version, the pages of our Service that
            you visit, the time and date of your visit, the time spent on those pages, unique device
            identifiers and other diagnostic data.
          </p>

          <h4>Tracking & Cookies Data</h4>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service
            and hold certain information.
          </p>
          <p>
            Cookies are files with small amount of data which may include an anonymous unique
            identifier. Cookies are sent to your browser from a website and stored on your device.
            Tracking technologies also used are beacons, tags, and scripts to collect and track
            information and to improve and analyze our Service.
          </p>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is
            being sent. However, if you do not accept cookies, you may not be able to use some
            portions of our Service.
          </p>
          <p>Examples of Cookies we use:</p>
          <ul>
            <li>
              <strong>Session Cookies.</strong> We use Session Cookies to operate our Service.
            </li>
            <li>
              <strong>Preference Cookies.</strong> We use Preference Cookies to remember your
              preferences and various settings.
            </li>
            <li>
              <strong>Security Cookies.</strong> We use Security Cookies for security purposes.
            </li>
          </ul>

          <h3>Use of Data</h3>

          <p>Pantheon uses the collected data for various purposes:</p>
          <ul>
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>
              To allow you to participate in interactive features of our Service when you choose to
              do so
            </li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h3>Transfer Of Data</h3>
          <p>
            Main instance of Pantheon is located in Finland at the moment of publishing this privacy
            policy.
          </p>
          <p>
            Your information, including Personal Data, may be transferred to — and maintained on —
            computers located outside of your state, province, country or other governmental
            jurisdiction where the data protection laws may differ than those from your
            jurisdiction.
          </p>
          <p>
            If you are located outside Finland and choose to provide information to us, please note
            that we may transfer the data, including Personal Data, to Finland and process it there.
          </p>
          <p>
            Your consent to this Privacy Policy followed by your submission of such information
            represents your agreement to that transfer.
          </p>
          <p>
            Pantheon will take all steps reasonably necessary to ensure that your data is treated
            securely and in accordance with this Privacy Policy and no transfer of your Personal
            Data will take place to an organization or a country unless there are adequate controls
            in place including the security of your data and other personal information.
          </p>

          <h3>Disclosure Of Data</h3>
          <p>
            Pantheon may disclose your Personal Data in the good faith belief that such action is
            necessary to:
          </p>
          <ul>
            <li>To comply with a legal obligation</li>
            <li>To protect and defend the rights or property of Pantheon</li>
            <li>To prevent or investigate possible wrongdoing in connection with the Service</li>
            <li>To protect the personal safety of users of the Service or the public</li>
            <li>To protect against legal liability</li>
          </ul>

          <h3>Security Of Data</h3>
          <p>
            The security of your data is important to us, but remember that no method of
            transmission over the Internet, or method of electronic storage is 100% secure. While we
            strive to use commercially acceptable means to protect your Personal Data, we cannot
            guarantee its absolute security.
          </p>

          <h3>Service Providers</h3>
          <p>
            We may employ third party companies and individuals to facilitate our Service ("Service
            Providers"), to provide the Service on our behalf, to perform Service-related services
            or to assist us in analyzing how our Service is used.
          </p>
          <p>
            These third parties have access to your Personal Data only to perform these tasks on our
            behalf and are obligated not to disclose or use it for any other purpose.
          </p>

          <h3>Analytics</h3>
          <p>
            An optional self-hosted analytic service may be used to monitor and analyze the use of
            our Service.
          </p>
          <ul>
            <li>
              <p>
                <strong>Umami.js</strong>
              </p>
              <p>
                Umami.js is an open source web analytics software that tracks and reports website
                traffic. This software is self-hosted on primary Pantheon server
                (pl.riichimahjong.org). All the collected data is anonymous, but it can be shared
                with developer crew to improve Pantheon service.
              </p>
              <p>
                For a self-hosted Pantheon instance, the administrator may choose to disable
                analytics collection, thus no data will be collected. Please consult with
                administrator of your service for details.
              </p>
            </li>
          </ul>

          <h3>Links To Other Sites</h3>
          <p>
            Our Service may contain links to other sites that are not operated by us. If you click
            on a third party link, you will be directed to that third party's site. We strongly
            advise you to review the Privacy Policy of every site you visit.
          </p>
          <p>
            We have no control over and assume no responsibility for the content, privacy policies
            or practices of any third party sites or services.
          </p>

          <h3>Children's Privacy</h3>
          <p>Our Service does not address anyone under the age of 18 ("Children").</p>
          <p>
            We do not knowingly collect personally identifiable information from anyone under the
            age of 18. If you are a parent or guardian and you are aware that your Children has
            provided us with Personal Data, please contact us. If we become aware that we have
            collected Personal Data from children without verification of parental consent, we take
            steps to remove that information from our servers.
          </p>

          <h3>Changes To This Privacy Policy</h3>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page.
          </p>
          <p>
            We will let you know via email and/or a prominent notice on our Service, prior to the
            change becoming effective and update the "effective date" at the top of this Privacy
            Policy.
          </p>
          <p>
            You are advised to review this Privacy Policy periodically for any changes. Changes to
            this Privacy Policy are effective when they are posted on this page.
          </p>

          <h3>Contact Us</h3>
          <p>If you have any questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li>
              By email: <a href={'mailto:' + environment.adminEmail}>{environment.adminEmail}</a>
            </li>
          </ul>
        </Collapse>
      </Container>
    </>
  );
};
