from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
)


class RegisterRequest(BaseModel):
    name: str = Field(
        min_length=2,
        max_length=100,
    )

    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str):
        cleaned_name = " ".join(
            value.strip().split()
        )

        if len(cleaned_name) < 2:
            raise ValueError(
                "Name must contain at least 2 characters"
            )

        return cleaned_name

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str):
        has_uppercase = any(
            character.isupper()
            for character in value
        )

        has_lowercase = any(
            character.islower()
            for character in value
        )

        has_digit = any(
            character.isdigit()
            for character in value
        )

        has_special = any(
            not character.isalnum()
            for character in value
        )

        if not all(
            [
                has_uppercase,
                has_lowercase,
                has_digit,
                has_special,
            ]
        ):
            raise ValueError(
                "Password must include uppercase, "
                "lowercase, number, and special character"
            )

        return value


class LoginRequest(BaseModel):
    email: EmailStr

    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value):
        return str(value).strip().lower()


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(
        min_length=1,
    )


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str


class RegisterResponse(BaseModel):
    message: str
    user: UserResponse


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse