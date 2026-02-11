/**
 * Certificate Manager
 * 
 * Handles SSL/TLS certificate generation for HTTPS interception.
 * Uses node-forge to create a local CA and issue certificates.
 * 
 * Note: For full HTTPS inspection, users must install the CA certificate
 * in their system/browser trust store.
 */

import fs from 'fs';
import path from 'path';
import forge from 'node-forge';

export class CertManager {
  constructor(certsDir) {
    this.certsDir = certsDir;
    this.ca = null;
    this.caKey = null;
    this.certCache = new Map();
    
    // Ensure certs directory exists
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }
    
    this.loadOrCreateCA();
  }
  
  /**
   * Load existing CA or create new one
   */
  loadOrCreateCA() {
    const caPath = path.join(this.certsDir, 'haven-ca.pem');
    const keyPath = path.join(this.certsDir, 'haven-ca-key.pem');
    
    if (fs.existsSync(caPath) && fs.existsSync(keyPath)) {
      try {
        const caPem = fs.readFileSync(caPath, 'utf8');
        const keyPem = fs.readFileSync(keyPath, 'utf8');
        
        this.ca = forge.pki.certificateFromPem(caPem);
        this.caKey = forge.pki.privateKeyFromPem(keyPem);
        
        console.log('   ✓ Loaded existing CA certificate');
        return;
      } catch (err) {
        console.warn('   ⚠ Failed to load CA, generating new one');
      }
    }
    
    // Generate new CA
    this.generateCA();
  }
  
  /**
   * Generate new CA certificate
   */
  generateCA() {
    console.log('   🔑 Generating CA certificate...');
    
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = this.generateSerial();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
    
    const attrs = [
      { shortName: 'CN', value: 'Haven Privacy Proxy CA' },
      { shortName: 'O', value: 'Haven' },
      { shortName: 'OU', value: 'Privacy Proxy' },
      { shortName: 'C', value: 'US' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    
    cert.setExtensions([
      { name: 'basicConstraints', cA: true, critical: true },
      { name: 'keyUsage', keyCertSign: true, cRLSign: true, critical: true },
      { name: 'subjectKeyIdentifier' }
    ]);
    
    cert.sign(keys.privateKey, forge.md.sha256.create());
    
    this.ca = cert;
    this.caKey = keys.privateKey;
    
    // Save to files
    const caPath = path.join(this.certsDir, 'haven-ca.pem');
    const keyPath = path.join(this.certsDir, 'haven-ca-key.pem');
    
    fs.writeFileSync(caPath, forge.pki.certificateToPem(cert));
    fs.writeFileSync(keyPath, forge.pki.privateKeyToPem(keys.privateKey));
    
    console.log('   ✓ CA certificate generated');
    console.log(`   📋 Install the CA from: ${caPath}`);
  }
  
  /**
   * Generate certificate for a hostname
   */
  getCertificate(hostname) {
    // Check cache first
    if (this.certCache.has(hostname)) {
      return this.certCache.get(hostname);
    }
    
    const keys = forge.pki.rsa.generateKeyPair(2048);
    const cert = forge.pki.createCertificate();
    
    cert.publicKey = keys.publicKey;
    cert.serialNumber = this.generateSerial();
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    
    const attrs = [
      { shortName: 'CN', value: hostname },
      { shortName: 'O', value: 'Haven Privacy Proxy' }
    ];
    
    cert.setSubject(attrs);
    cert.setIssuer(this.ca.subject.attributes);
    
    cert.setExtensions([
      { name: 'basicConstraints', cA: false },
      { name: 'keyUsage', digitalSignature: true, keyEncipherment: true },
      { name: 'extKeyUsage', serverAuth: true },
      { name: 'subjectAltName', altNames: [{ type: 2, value: hostname }] }
    ]);
    
    cert.sign(this.caKey, forge.md.sha256.create());
    
    const result = {
      key: forge.pki.privateKeyToPem(keys.privateKey),
      cert: forge.pki.certificateToPem(cert)
    };
    
    // Cache the certificate
    this.certCache.set(hostname, result);
    
    return result;
  }
  
  /**
   * Get CA certificate for installation
   */
  getCA() {
    return {
      cert: forge.pki.certificateToPem(this.ca),
      path: path.join(this.certsDir, 'haven-ca.pem')
    };
  }
  
  /**
   * Generate random serial number
   */
  generateSerial() {
    return Date.now().toString(16) + Math.random().toString(16).substring(2);
  }
  
  /**
   * Clear certificate cache
   */
  clearCache() {
    this.certCache.clear();
  }
}
