import { expect } from 'chai';
import { generatePackageId } from '../src/script/utils/android-validation';

describe('Android Package ID Generation', () => {
  it('should handle basic domain without keywords', () => {
    const result = generatePackageId('example.com');
    expect(result).to.equal('com.example.twa');
  });

  it('should handle domain with Java keyword "new"', () => {
    const result = generatePackageId('new.kpr-co.com');
    expect(result).to.equal('com.kpr_co.new_.twa');
  });

  it('should handle domain with Java keyword "if"', () => {
    const result = generatePackageId('if.example.com');
    expect(result).to.equal('com.example.if_.twa');
  });

  it('should handle domain with multiple Java keywords', () => {
    const result = generatePackageId('new.if.example.com');
    expect(result).to.equal('com.example.if_.new_.twa');
  });

  it('should handle domain with Java keyword "class"', () => {
    const result = generatePackageId('class.myapp.com');
    expect(result).to.equal('com.myapp.class_.twa');
  });

  it('should handle domain with Java keyword "interface"', () => {
    const result = generatePackageId('interface.example.org');
    expect(result).to.equal('org.example.interface_.twa');
  });

  it('should handle domain with Java keyword "public"', () => {
    const result = generatePackageId('public.api.com');
    expect(result).to.equal('com.api.public_.twa');
  });

  it('should handle domain with Java keyword "static"', () => {
    const result = generatePackageId('static.files.com');
    expect(result).to.equal('com.files.static_.twa');
  });

  it('should handle complex domain with keywords and special characters', () => {
    const result = generatePackageId('new.test-app.com');
    expect(result).to.equal('com.test_app.new_.twa');
  });

  it('should not modify non-keyword parts', () => {
    const result = generatePackageId('app.example.com');
    expect(result).to.equal('com.example.app.twa');
  });

  it('should handle domain with leading numbers in parts', () => {
    const result = generatePackageId('new.123test.com');
    expect(result).to.equal('com.app_123test.new_.twa');
  });
});