/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { isEmpty } from "lodash-es";
// plane internal packages
import { API_BASE_URL } from "@plane/constants";
import type { IFormattedInstanceConfiguration, TInstanceOIDCAuthenticationConfigurationKeys } from "@plane/types";
// components
import { CodeBlock } from "@/components/common/code-block";
import type { TControllerInputFormField } from "@/components/common/controller-input";
import type { TControllerSwitchFormField } from "@/components/common/controller-switch";
import type { TCopyField } from "@/components/common/copy-field";
import { OAuthProviderForm } from "@/components/authentication/oauth-provider-form";
// hooks
import { useOAuthProviderConfigForm } from "@/hooks/use-oauth-provider-config-form";

type Props = {
  config: IFormattedInstanceConfiguration;
};

type OIDCConfigFormValues = Record<TInstanceOIDCAuthenticationConfigurationKeys, string>;

const OIDC_FORM_SWITCH_FIELD: TControllerSwitchFormField<OIDCConfigFormValues> = {
  name: "ENABLE_OIDC_SYNC",
  label: "OIDC",
};

export function InstanceOIDCConfigForm(props: Props) {
  const { config } = props;
  // form data
  const {
    control,
    formState: { errors },
    onSave,
  } = useOAuthProviderConfigForm<OIDCConfigFormValues>("OIDC", {
    OIDC_URL: config["OIDC_URL"],
    OIDC_CLIENT_ID: config["OIDC_CLIENT_ID"],
    OIDC_CLIENT_SECRET: config["OIDC_CLIENT_SECRET"],
    ENABLE_OIDC_SYNC: config["ENABLE_OIDC_SYNC"] || "0",
  });

  const originURL = !isEmpty(API_BASE_URL) ? API_BASE_URL : typeof window !== "undefined" ? window.location.origin : "";

  const OIDC_FORM_FIELDS: TControllerInputFormField<OIDCConfigFormValues>[] = [
    {
      key: "OIDC_URL",
      type: "text",
      label: "Issuer URL",
      description: (
        <>
          The base issuer URL of your identity provider. Plane reads its{" "}
          <CodeBlock>{`/.well-known/openid-configuration`}</CodeBlock> discovery document to find the authorization,
          token, userinfo and JWKS endpoints.
        </>
      ),
      placeholder: "https://idp.example.com",
      error: Boolean(errors.OIDC_URL),
      required: true,
    },
    {
      key: "OIDC_CLIENT_ID",
      type: "text",
      label: "Client ID",
      description: <>The client ID of the OIDC application you registered with your identity provider.</>,
      placeholder: "client-id",
      error: Boolean(errors.OIDC_CLIENT_ID),
      required: true,
    },
    {
      key: "OIDC_CLIENT_SECRET",
      type: "password",
      label: "Client Secret",
      description: <>The client secret of the OIDC application you registered with your identity provider.</>,
      placeholder: "client-secret",
      error: Boolean(errors.OIDC_CLIENT_SECRET),
      required: true,
    },
  ];

  const OIDC_SERVICE_FIELD: TCopyField[] = [
    {
      key: "Callback_URL",
      label: "Callback URL",
      url: `${originURL}/auth/oidc/callback/`,
      description: (
        <>
          We will auto-generate this. Paste this into the <CodeBlock darkerShade>Redirect URI</CodeBlock> field of the
          OIDC application you registered with your identity provider.
        </>
      ),
    },
  ];

  return (
    <OAuthProviderForm
      providerName="OIDC"
      control={control}
      formFields={OIDC_FORM_FIELDS}
      switchField={OIDC_FORM_SWITCH_FIELD}
      onSave={onSave}
      serviceDetails={OIDC_SERVICE_FIELD}
    />
  );
}
