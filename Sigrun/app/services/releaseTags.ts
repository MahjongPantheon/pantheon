/*  Sigrun: rating tables and statistics frontend
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

export function handleReleaseTag(r: Response) {
  if (import.meta.env.SSR) {
    // client-only reloading
    return r;
  }
  const release = r.headers.get('X-Release');
  const tag = window.localStorage.getItem('__releaseTag');
  if (release && !tag) {
    window.localStorage.setItem('__releaseTag', release);
  }
  if (release && tag && release !== tag) {
    window.localStorage.setItem('__releaseTag', release);
    window.location.reload();
  }
  return r;
}
