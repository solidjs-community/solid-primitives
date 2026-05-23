import { lazy, Loading } from "solid-js";
import { ClientOnly } from "~/primitives/client-only.js";
import type * as API from "./ClientSearchModal.js";

const ClientSearchModal = lazy(() => import("./ClientSearchModal.jsx"));

const SearchModal: typeof API.default = props => {
  return (
    <ClientOnly>
      <Loading>
        <ClientSearchModal {...props} />
      </Loading>
    </ClientOnly>
  );
};

export default SearchModal;
