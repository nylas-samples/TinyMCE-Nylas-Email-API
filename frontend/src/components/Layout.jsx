import React, { useState } from 'react';
import IconSync from './icons/IconSync.jsx';
import IconLogout from './icons/IconLogout.jsx';
import NylasLogo from './icons/nylas-logo-horizontal.svg';
import PropTypes from 'prop-types';
import Toast from './Toast';

const Layout = ({
  children,
  showMenu = false,
  disconnectUser,
  refresh,
  isLoading,
  title,
  toastNotification,
  setToastNotification,
}) => {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleRefresh = (e) => {
    e.preventDefault();
    refresh();
  };

  const handleDisconnect = (e) => {
    e.preventDefault();
    setIsDisconnecting(true);
    setTimeout(() => {
      disconnectUser();
      setIsDisconnecting(false);
    }, 1500);
  };

  return (
    <div className="layout">
      <div className="title-menu">
        <h1>{title || 'Sample app'}</h1>

        <Toast
          toastNotification={toastNotification}
          setToastNotification={setToastNotification}
        />
        {showMenu && (
          <div className="menu">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isDisconnecting || toastNotification}
            >
              <div className={`menu-icon ${isLoading ? 'syncing' : ''}`}>
                <IconSync />
              </div>
              <span className="hidden-mobile">
                {isLoading ? 'Refreshing' : 'Refresh'}
              </span>
            </button>
            <div className="hidden-mobile">·</div>
            <button
              onClick={handleDisconnect}
              disabled={isLoading || isDisconnecting || toastNotification}
            >
              <div className="menu-icon">
                <IconLogout />
              </div>
              <span className="hidden-mobile">
                {isDisconnecting ? 'Disconnecting...' : 'Disconnect account'}
              </span>
            </button>
          </div>
        )}
      </div>
      <main>{children}</main>
      <footer>
        <div className="logo">
          POWERED BY
          <div>
            <img src={NylasLogo} alt="Nylas Logo" width="140"/>
            &nbsp; &nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="98" height="32" viewBox="0 0 98 32" fill='white'><g id="logo-fill"><title>Tiny Logo</title><path d="M84.831 7.352l3.216 9.055.766 2.762.918-2.762 3.216-9.055H98l-8.437 23.574L84.112 32l2.25-6.385-6.584-18.263h5.053zM20.24 0c5.206.03 10.35 4.357 10.35 10.662 0 0 .032 1.602.036 3.54v.81c-.001.365-.004.735-.007 1.103l-.007.55c-.023 1.548-.077 2.989-.19 3.739-.72 4.817-4.318 8.146-9.278 8.99-4.47.874-7.12 1.38-7.977 1.549-.367.077-1.99.291-2.694.291-5.45 0-10.395-4.08-10.472-10.662v-1.081l.001-.186v-.406c.002-.709.004-1.578.008-2.472l.003-.539c.008-1.709.023-3.414.05-4.198.183-4.802 3.505-8.683 9.828-9.926L17.943.2C18.678.061 19.489 0 20.239 0zm25.392 2.44v4.912h4.594v4.45h-4.594v7.674c0 1.504 1.133 2.149 1.838 2.149.603 0 1.151-.068 1.71-.222l.28-.085 1.072 3.53c-.46.307-1.837 1.074-4.44 1.074-2.604 0-5.299-1.995-5.36-5.371-.043-2.124-.046-4.832-.007-8.124l.007-.625h-3.215v-4.45h3.215v-3.96l4.9-.952zM23.883 5.6L11.635 7.976v4.787l-4.899.95V25.65l12.248-2.378v-4.786l4.899-.951V5.599zm47.78 1.291c4.265-.03 7.499 3.335 7.65 7.577l.006.25v10.897h-4.9v-10.13c-.016-2.301-1.685-4.158-3.981-4.143-2.228.015-4.181 1.733-4.284 3.936l-.004.208v10.13h-4.9V7.351h4.44l.17 2.133c1.423-1.566 3.52-2.579 5.802-2.594zm-13.475.46v18.264h-4.9V7.352h4.9zm-39.204 3.986v7.149l-7.349 1.427v-7.15l7.349-1.426zM58.187 0v4.773l-4.9.952V.952l4.9-.952z" transform="translate(-16 -12) translate(16 12)"></path></g></svg>
          </div>
        </div>
      </footer>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.element.isRequired,
  showMenu: PropTypes.bool.isRequired,
  disconnectUser: PropTypes.func,
  refresh: PropTypes.func,
  isLoading: PropTypes.bool.isRequired,
  title: PropTypes.string,
  toastNotification: PropTypes.string,
  setToastNotification: PropTypes.func.isRequired,
};

export default Layout;
