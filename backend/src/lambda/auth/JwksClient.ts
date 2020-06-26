
import Axios from 'axios'

import { certToPEM } from '../utils';

async function getJwks(jwksUrl): Promise<any> {
    try {
        const jwksResponse = await Axios.get(jwksUrl);
        return jwksResponse.data.keys;
    } catch (error) {
        throw new Error('Cannot get keys from the JWKS endpoint: ' + error);
    }
}

async function getSigningKeys(jwksUrl): Promise<any> {
    const keys = await getJwks(jwksUrl);

    if (!keys || !keys.length) {
        throw new Error('The JWKS endpoint did not contain any keys');
    }

    const signingKeys = keys
        .filter(key => key.use === 'sig' // JWK property `use` determines the JWK is for signing
            && key.kty === 'RSA' // We are only supporting RSA
            && key.kid           // The `kid` must be present to be useful for later
            && key.x5c && key.x5c.length // Has useful public keys (we aren't using n or e)
        ).map(key => {
            return { kid: key.kid, nbf: key.nbf, publicKey: certToPEM(key.x5c[0]) };
        });

    // If at least a single signing key doesn't exist we have a problem... Kaboom.
    if (!signingKeys.length) {
        throw new Error('The JWKS endpoint did not contain any signing keys');
    }

    // Returns all of the available signing keys.
    return signingKeys;

}

export async function getSigningKey(jwksUrl, kid): Promise<string> {
    const keys = await getSigningKeys(jwksUrl);
    const signingKey = keys.find(key => key.kid === kid);

    if (!signingKey) {
        throw new Error('Unable to find a signing key that matches');
    }

    // Provide the key.
    return signingKey.publicKey
}