import { Test } from "@nestjs/testing"
import { AuthService } from "./auth.service"
import { UsersService } from "./users.service"
import { User } from "./user.entity"

describe("AuthService", () => {
    let service: AuthService
    let fakeUsersService: Partial<UsersService>

    beforeEach(async () => {
        fakeUsersService = {
            find: () => Promise.resolve([]),
            create: (email: string, password: string) => Promise.resolve({
                id: 1,
                email,
                password,
            } as User)
        }

        const module = await Test.createTestingModule({
            providers: [AuthService, {
                provide: UsersService,
                useValue: fakeUsersService
            }],
        }).compile()

        service = module.get(AuthService)
    })

    it("can create an instance of auth service", async () => {
        expect(service).toBeDefined()
    })

    it("create a new user with a salted and hashed password", async () => {
        const user = await service.signup("asdf@gmail.com", "asdf")

        expect(user.password).not.toEqual("asdf")
        const [salt, hash] = user.password.split(".")
        expect(salt).toBeDefined()
        expect(hash).toBeDefined()
    })

    it("throws an error if user signs up with email that is in use", (done) => {
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: "asdf@gmail.com", password: "asdf" } as User])

        service.signup("asdf@gmail.com", "asdf")
            .catch(() => {
                done();
            });
    })

    it("throws if signin is called with an unused email", (done) => {
        service.signin("asdf@gmail.com", "asdf")
            .catch(() => {
                done();
            });
    })

    it("throws if an invalid password is provided", (done) => {
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: "asdf@gmail.com", password: "wrongpassword" } as User])

        service.signin("asdf@gmail.com", "asdf")
            .catch(() => {
                done();
            });
    })

    it("returns if user with correct password is provided", async () => {
        fakeUsersService.find = () => Promise.resolve([{ id: 1, email: "asdf@gmail.com", password: "86e2796a14bae7a6.20d8963366cb0e036d83694da1e08f6a24af2b2d18be27b08c869e2d7858e129" } as User])
        const user = await service.signin("asdf@gmail.com", "mypassword")
        expect(user).toBeDefined()
    })

})