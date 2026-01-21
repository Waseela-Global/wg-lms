import React from 'react'
import ReactDOM from 'react-dom/client'
import { FrappeProvider } from 'frappe-react-sdk'
import App from './App'
import './index.css'

// Function to get CSRF token from cookies or window
const getCSRFToken = () => {
	// First, try to get from window (production mode with templated HTML)
	if (
		window.csrf_token &&
		typeof window.csrf_token === "string" &&
		!window.csrf_token.includes( "{{" )
	) {
		return window.csrf_token;
	}

	// Fallback: Get from cookies (development mode after initial fetch)
	const cookies = document.cookie.split( '; ' );
	const csrfCookie = cookies.find( row => row.startsWith( 'csrf_token=' ) );
	if ( csrfCookie ) {
		return csrfCookie.split( '=' )[ 1 ];
	}

	return null;
};

// Initialize CSRF token in development mode
if ( import.meta.env.DEV && !window.csrf_token ) {
	fetch( '/api/method/wg_lms.www.lms.get_context_for_dev', {
		method: 'GET',
		credentials: 'include',
	} )
		.then( res => res.json() )
		.then( data => {
			if ( data.message?.csrf_token ) {
				window.csrf_token = data.message.csrf_token;
				window.site_name = data.message.site_name || window.site_name;
				if ( !window.frappe ) window.frappe = {};
				window.frappe.boot = data.message.boot || {};
			}
		} )
		.catch( err => {
			console.error( 'Failed to fetch dev context:', err );
		} );
}

const root = ReactDOM.createRoot( document.getElementById( 'root' ) )

root.render(
	// <React.StrictMode>
	<FrappeProvider
		url={window.location.origin}
		socketPort={undefined}
		enableSocket={false}
		siteName={window.frappe?.boot?.site_name || window.site_name}
		tokenParams={{
			useToken: true,
			token: getCSRFToken,
			type: "token",
		}}
	>
		<App />
	</FrappeProvider>
	// </React.StrictMode>
)