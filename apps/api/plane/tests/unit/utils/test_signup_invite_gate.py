# Copyright (c) 2023-present Plane Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

"""
Unit tests for the sign-up gate in Adapter.__check_signup.

A pending workspace invite lets a new account past ENABLE_SIGNUP and
ENABLE_EMAIL_SIGNUP only through a provider that proves the caller controls
the invited address (magic code, OAuth/OIDC). Email/password sign-up for an
invited address goes through the gates like any other new account.
"""

from unittest import mock

import pytest

from plane.authentication.adapter import base
from plane.authentication.adapter.base import Adapter
from plane.authentication.adapter.error import AuthenticationException

INVITED = "invited@example.com"


def gate(provider, credential, signup="0", email_signup="0", invited=True):
    adapter = Adapter.__new__(Adapter)
    adapter.provider = provider
    adapter.is_credential_provider = credential
    adapter.logger = mock.Mock()
    invites = mock.Mock()
    invites.objects.filter.return_value.exists.return_value = invited
    with mock.patch.object(base, "WorkspaceMemberInvite", invites), mock.patch.object(
        base, "get_configuration_value", return_value=(signup, email_signup)
    ):
        return adapter._Adapter__check_signup(INVITED)


@pytest.mark.unit
class TestSignupInviteGate:
    def test_invite_opens_magic_code_signup(self):
        assert gate("magic-code", credential=True) is True

    def test_invite_opens_oidc_signup(self):
        assert gate("oidc", credential=False) is True

    def test_invite_does_not_open_password_signup_when_signup_is_off(self):
        with pytest.raises(AuthenticationException):
            gate("email", credential=True)

    def test_invite_does_not_open_password_signup_when_email_signup_is_off(self):
        with pytest.raises(AuthenticationException):
            gate("email", credential=True, signup="1")

    def test_password_signup_follows_the_flags_when_they_allow_it(self):
        assert gate("email", credential=True, signup="1", email_signup="1") is True
