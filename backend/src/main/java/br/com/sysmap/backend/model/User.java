package br.com.sysmap.backend.model;

import br.com.sysmap.backend.model.enums.InterestType;
import jakarta.persistence.*;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    private UUID id;

    private String name;

    private String email;

    private String cpf;

    private String password;

    private boolean active;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(nullable = false)
    private int xp;

    @Column(nullable = false)
    private int level;

    @ElementCollection(targetClass = InterestType.class, fetch = FetchType.EAGER)
    @CollectionTable(
            name = "user_interests",
            joinColumns = @JoinColumn(name = "user_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "interest")
    private Set<InterestType> interests = new HashSet<>();


}