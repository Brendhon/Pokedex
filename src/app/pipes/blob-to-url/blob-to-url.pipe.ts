import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'blobToUrl'
})
export class BlobToUrlPipe implements PipeTransform {

  constructor(
    private sanitizer: DomSanitizer
  ) { }

  transform(value: Blob): unknown {
    return this.getImgUrl(value);
  }

  /**
   * Get img url
   * @param {Blob} img Blob
   * @returns {SafeResourceUrl} Safe Resource Url
   */
   public getImgUrl(img: Blob): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(img))
  }

}
