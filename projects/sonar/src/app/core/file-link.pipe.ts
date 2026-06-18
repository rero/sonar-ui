// SPDX-FileCopyrightText: Fondation RERO+
// SPDX-License-Identifier: AGPL-3.0-or-later
import { inject, Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Generate a file link.
 */
@Pipe({ name: 'fileLink' })
export class FileLinkPipe implements PipeTransform {

  public sanitizer: DomSanitizer = inject(DomSanitizer);

  /**
   * Generate the link for a file
   *
   * @param key File key
   * @param resourceType Type of the resource
   * @param resourceId Id of the resource
   * @param fileType If we want to have "files" or "preview"
   * @return Generated URL.
   */
  transform(key: string, resourceType: string, resourceId: string, fileType = 'files'): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(`${resourceType}/${resourceId}/${fileType}/${key}`);
  }
}
