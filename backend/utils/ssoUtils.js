import crypto from 'crypto';
import jwt from 'jsonwebtoken';

/**
 * Single Sign-On (SSO) utilities
 * Handles SAML, OAuth2, and other SSO protocols
 */
class SSOUtils {
  constructor() {
    this.ssoSecret = process.env.SSO_SECRET || 'your-sso-secret-key';
    this.ssoIssuer = process.env.SSO_ISSUER || 'erp-system';
  }

  generateSAMLRequest(config) {
    const {
      issuer = this.ssoIssuer,
      destination,
      assertionConsumerServiceURL,
      relayState = null
    } = config;

    const requestId = `_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    return {
      id: requestId,
      version: '2.0',
      issueInstant: timestamp,
      issuer,
      destination,
      assertionConsumerServiceURL,
      relayState
    };
  }

  generateSAMLResponse(config, user) {
    const {
      issuer = this.ssoIssuer,
      destination,
      assertionConsumerServiceURL,
      relayState = null
    } = config;

    const responseId = `_${crypto.randomUUID()}`;
    const assertionId = `_${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    return {
      id: responseId,
      version: '2.0',
      issueInstant: timestamp,
      destination,
      issuer,
      status: {
        statusCode: {
          value: 'urn:oasis:names:tc:SAML:2.0:status:Success'
        }
      },
      assertion: {
        id: assertionId,
        version: '2.0',
        issueInstant: timestamp,
        issuer,
        subject: {
          nameID: {
            format: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
            value: user.email
          },
          subjectConfirmation: {
            method: 'urn:oasis:names:tc:SAML:2.0:cm:bearer',
            subjectConfirmationData: {
              notOnOrAfter: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
              recipient: assertionConsumerServiceURL
            }
          }
        },
        conditions: {
          notBefore: timestamp,
          notOnOrAfter: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          audienceRestriction: {
            audience: issuer
          }
        },
        attributeStatement: {
          attributes: [
            {
              name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
              attributeValue: user.email
            },
            {
              name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
              attributeValue: user.firstName
            },
            {
              name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
              attributeValue: user.lastName
            },
            {
              name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role',
              nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:uri',
              attributeValue: user.role?.name || 'user'
            }
          ]
        }
      },
      relayState
    };
  }

  generateOAuth2AuthURL(config) {
    const {
      clientId,
      redirectUri,
      scope = 'openid profile email',
      state,
      responseType = 'code'
    } = config;

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope,
      response_type: responseType,
      state: state || crypto.randomBytes(16).toString('hex')
    });

    return `${config.authorizationEndpoint}?${params.toString()}`;
  }

  async exchangeOAuth2Code(config, code) {
    const {
      clientId,
      clientSecret,
      redirectUri,
      tokenEndpoint
    } = config;

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code
    });

    try {
      const response = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new Error(`OAuth2 token exchange failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`OAuth2 token exchange error: ${error.message}`);
    }
  }

  async getOAuth2UserInfo(config, accessToken) {
    const { userInfoEndpoint } = config;

    try {
      const response = await fetch(userInfoEndpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(`OAuth2 user info error: ${error.message}`);
    }
  }

  generateSSOToken(user, config = {}) {
    const {
      expiresIn = '1h',
      issuer = this.ssoIssuer,
      audience = 'erp-system'
    } = config;

    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role?.name,
      roleId: user.roleId,
      sso: true,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (expiresIn === '1h' ? 3600 : parseInt(expiresIn))
    };

    return jwt.sign(payload, this.ssoSecret, {
      issuer,
      audience
    });
  }

  verifySSOToken(token, config = {}) {
    const {
      issuer = this.ssoIssuer,
      audience = 'erp-system'
    } = config;

    try {
      return jwt.verify(token, this.ssoSecret, {
        issuer,
        audience
      });
    } catch (error) {
      throw new Error(`Invalid SSO token: ${error.message}`);
    }
  }

  generateState(data = {}) {
    const state = {
      nonce: crypto.randomBytes(16).toString('hex'),
      timestamp: Date.now(),
      ...data
    };

    return Buffer.from(JSON.stringify(state)).toString('base64');
  }

  verifyState(state, maxAge = 10 * 60 * 1000) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
      
      // Check if state is not too old
      if (Date.now() - decoded.timestamp > maxAge) {
        throw new Error('State parameter expired');
      }

      return decoded;
    } catch (error) {
      throw new Error(`Invalid state parameter: ${error.message}`);
    }
  }

  generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return {
      codeVerifier,
      codeChallenge,
      codeChallengeMethod: 'S256'
    };
  }
}

// Export singleton instance
export const ssoUtils = new SSOUtils();
export default ssoUtils;
