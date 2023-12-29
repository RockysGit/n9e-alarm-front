/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { ReactNode, useContext, useState, useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import Icon, { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { Menu, Dropdown, Space, Drawer } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Logout } from '@/services/login';
import AdvancedWrap, { License } from '@/components/AdvancedWrap';
import { CommonStateContext } from '@/App';
import { AccessTokenKey } from '@/utils/constant';
import DarkModeSelect from '@/components/DarkModeSelect';
import Version from './Version';
import SideMenuColorSetting from './SideMenuColorSetting';
import './index.less';
import './locale';

interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String | JSX.Element;
  children?: ReactNode;
  introIcon?: ReactNode;
  rightArea?: ReactNode;
  customArea?: ReactNode;
  showBack?: Boolean;
  backPath?: string;
  docFn?: Function;
}

const i18nMap = {
  zh_CN: '简体',
  zh_HK: '繁體',
  en_US: 'En',
};

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, introIcon, children, customArea, showBack, backPath, docFn }) => {
  const { t, i18n } = useTranslation('pageLayout');
  const history = useHistory();
  const { profile, siteInfo } = useContext(CommonStateContext);
  const embed = localStorage.getItem('embed') === '1' && window.self !== window.top;
  const [curLanguage, setCurLanguage] = useState(i18nMap[i18n.language] || '中文');
  const [themeVisible, setThemeVisible] = useState(false);
  useEffect(() => {
    setCurLanguage(i18nMap[i18n.language] || '中文');
  }, [i18n.language]);

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('profile')}
      </Menu.Item>
      {import.meta.env.VITE_IS_ENT !== 'true' && (
        <Menu.Item
          onClick={() => {
            setThemeVisible(true);
          }}
        >
          {t('themeSetting')}
        </Menu.Item>
      )}
      <Menu.Item
        onClick={() => {
          Logout().then(() => {
            localStorage.removeItem(AccessTokenKey);
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('curBusiId');
            history.push('/login');
          });
        }}
      >
        {t('logout')}
      </Menu.Item>
    </Menu>
  );

  return (
    <div className={'page-wrapper'}>
      {!embed && (
        <>
          {' '}
          {customArea ? (
            <div className={'page-top-header'}>{customArea}</div>
          ) : (
            <div className={'page-top-header'}>
              <div className={`page-header-content ${import.meta.env.VITE_IS_ENT !== 'true' ? 'n9e-page-header-content' : ''}`}>
                <div className={'page-header-title'}>
                  {showBack && (
                    <RollbackOutlined
                      onClick={() => {
                        if (backPath) {
                          history.push({
                            pathname: backPath,
                          });
                        } else {
                          history.goBack();
                        }
                      }}
                      style={{
                        marginRight: '5px',
                      }}
                    />
                  )}
                  {icon}
                  {title}
                </div>

                <div className={'page-header-right-area'}>
                  {introIcon}
                  {docFn && (
                    <a onClick={() => docFn()} style={{ marginRight: 20 }}>
                      {t('docs')}
                    </a>
                  )}

                  <Version />

                  {/* 整合版本关闭文档链接 */}
                  {import.meta.env.VITE_IS_ENT !== 'true' && (
                    <Space style={{ marginRight: 16 }}>
                      <div style={{ marginRight: 8, position: 'relative' }}>
                        <a target='_blank' href={siteInfo?.document_url || 'https://flashcat.cloud/docs/'}>
                          {t('docs')}
                        </a>
                      </div>
                      {profile?.admin && (
                        <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                          <Link to='/audits'>{t('audits:title')}</Link>
                        </AdvancedWrap>
                      )}
                    </Space>
                  )}

                  {rightArea}

                  <AdvancedWrap var='VITE_IS_PRO,VITE_IS_ENT'>
                    <License />
                  </AdvancedWrap>

                  <Dropdown
                    overlay={
                      <Menu
                        onSelect={({ key }) => {
                          i18n.changeLanguage(key);
                          setCurLanguage(i18nMap[key]);
                          localStorage.setItem('language', key);
                        }}
                        selectable
                      >
                        {Object.keys(i18nMap).map((el) => {
                          return <Menu.Item key={el}>{i18nMap[el]}</Menu.Item>;
                        })}
                      </Menu>
                    }
                  >
                    <a style={{ marginRight: 20 }} onClick={(e) => e.preventDefault()} id='i18n-btn'>
                      {curLanguage}
                    </a>
                  </Dropdown>
                  <div style={{ marginRight: 8 }}>
                    <DarkModeSelect />
                  </div>
                  <Dropdown overlay={menu} trigger={['click']}>
                    <span className='avator' style={{ cursor: 'pointer' }}>
                      <img src={profile.portrait || '/image/avatar1.png'} alt='' />
                      <span className='display-name'>{profile.nickname || profile.username}</span>
                      <DownOutlined />
                    </span>
                  </Dropdown>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {children && children}
      <Drawer
        closable={false}
        visible={themeVisible}
        onClose={() => {
          setThemeVisible(false);
        }}
      >
        <div>
          <div>
            <div className='text-lg font-semibold dark:text-slate-50 text-l1'>主题配置</div>
            <div className='text-sm text-hint mt-1'>配置仅对当前用户生效</div>
          </div>
          <div className='m-2'>
            <SideMenuColorSetting />
          </div>
        </div>
      </Drawer>
    </div>
  );
};

export default PageLayout;
