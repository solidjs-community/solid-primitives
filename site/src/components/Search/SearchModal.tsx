import { lazy, Suspense } from "solid-js";
import { ClientOnly } from "~/primitives/client-only.js";
import type * as API from "./ClientSearchModal.js";

const ClientSearchModal = lazy(() => import("./ClientSearchModal.jsx"));

const SearchModal: typeof API.default = props => {
  return (
    <ClientOnly>
      <Suspense>
        <ClientSearchModal {...props} />
      </Suspense>
    </ClientOnly>
  );
};

export default SearchModal;
